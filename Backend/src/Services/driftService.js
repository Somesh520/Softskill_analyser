import SkillBaseline from '../Models/SkillBaselineModel.js';
import DriftEvent from '../Models/DriftEventModel.js';
import ActivitySubmission from '../Models/ActivitySubmissionmodel.js';

/**
 * Update baseline and variance using Exponentially Weighted Moving Average (EWMA)
 */
function updateBaseline(prevBaseline, prevVariance, newScore, alpha = 0.3) {
  const newBaseline = alpha * newScore + (1 - alpha) * prevBaseline;
  const deviation = Math.abs(newScore - prevBaseline);
  const newVariance = alpha * (deviation ** 2) + (1 - alpha) * prevVariance;
  return { baseline: newBaseline, variance: newVariance };
}

/**
 * Compute adaptive threshold based on historical variance and sample size.
 * Threshold tightens as more data accumulates.
 */
function computeAdaptiveThreshold(variance, activityCount) {
  // If no variance (e.g. first activity), use a generic minimum threshold
  if (activityCount === 0 || variance === 0) return 10.0;
  
  const stdDev = Math.sqrt(variance);
  const confidenceFactor = Math.max(1.0, 3 / Math.sqrt(activityCount));
  
  // Ensure threshold doesn't become impossibly small or excessively large
  let threshold = stdDev * confidenceFactor;
  return Math.max(5.0, Math.min(threshold, 25.0));
}

/**
 * Detect significant drift based on observed score, baseline, and threshold
 */
function detectDrift(observedScore, baseline, threshold) {
  const magnitude = observedScore - baseline;
  const isSignificant = Math.abs(magnitude) > threshold;
  return {
    magnitude,
    direction: magnitude >= 0 ? "positive" : "negative",
    isSignificant,
  };
}

/**
 * Find how other skills moved in the same activity
 */
async function findCorrelatedDrift(studentId, skillType, activityId) {
  const submission = await ActivitySubmission.findOne({ studentId, activityId }).lean();
  if (!submission || !submission.criteriaMarks) return {};

  const correlations = {};
  
  for (const [otherSkill, score] of Object.entries(submission.criteriaMarks)) {
    if (otherSkill === skillType) continue; // Skip the main skill

    // Find baseline for other skill
    const otherBaseline = await SkillBaseline.findOne({ studentId, skillType: otherSkill }).lean();
    if (otherBaseline) {
      correlations[otherSkill] = score - otherBaseline.baselineValue;
    } else {
      correlations[otherSkill] = score; // No baseline yet
    }
  }
  return correlations;
}

/**
 * Main pipeline wrapper: Evaluate a single grade for drift and update baselines
 */
export async function processNewGrade(studentId, activityId, skillType, newScore, teacherRemark) {
  try {
    let baseline = await SkillBaseline.findOne({ studentId, skillType });
    
    // First time this student is graded on this skill
    if (!baseline) {
      await SkillBaseline.create({
        studentId,
        skillType,
        baselineValue: newScore,
        variance: 0,
        activityCount: 1
      });
      return; // No drift possible on first grade
    }

    const threshold = computeAdaptiveThreshold(baseline.variance, baseline.activityCount);
    const drift = detectDrift(newScore, baseline.baselineValue, threshold);

    if (drift.isSignificant) {
      const correlations = await findCorrelatedDrift(studentId, skillType, activityId);
      await DriftEvent.create({
        studentId,
        activityId,
        skillType,
        baselineAtDetection: baseline.baselineValue,
        observedValue: newScore,
        driftMagnitude: drift.magnitude,
        driftDirection: drift.direction,
        isSignificant: true,
        thresholdUsed: threshold,
        linkedFeedback: teacherRemark || '',
        correlatedSkills: correlations,
      });
    }

    // Update EWMA
    const updated = updateBaseline(baseline.baselineValue, baseline.variance, newScore);
    
    await SkillBaseline.updateOne(
      { _id: baseline._id },
      {
        $set: {
          baselineValue: updated.baseline,
          variance: updated.variance,
        },
        $inc: { activityCount: 1 },
      }
    );
  } catch (error) {
    console.error(`Error processing drift for student ${studentId} on skill ${skillType}:`, error);
  }
}
