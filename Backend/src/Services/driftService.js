import mongoose from 'mongoose';
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
 * Find how other skills moved in the same activity (normalized to 100-point scale)
 */
async function findCorrelatedDriftNormalized(studentId, activity, skillType) {
  const submission = await ActivitySubmission.findOne({ studentId, activityId: activity._id }).lean();
  if (!submission || !submission.criteriaMarks) return {};

  const correlations = {};
  const marksObj = submission.criteriaMarks instanceof Map ? Object.fromEntries(submission.criteriaMarks) : submission.criteriaMarks;
  
  for (const [otherSkill, score] of Object.entries(marksObj)) {
    if (otherSkill.toLowerCase() === skillType.toLowerCase()) continue; // Skip the main skill

    // Normalize other score
    const otherRubric = (activity.rubrics || []).find(
      r => r.criteria && r.criteria.toLowerCase() === otherSkill.toLowerCase()
    );
    const maxWeight = otherRubric ? otherRubric.weight : 100;
    const normalizedOtherScore = maxWeight > 0 ? (score / maxWeight) * 100 : score;

    // Find baseline for other skill
    const otherBaseline = await SkillBaseline.findOne({ studentId, skillType: otherSkill }).lean();
    if (otherBaseline) {
      correlations[otherSkill] = Math.round((normalizedOtherScore - otherBaseline.baselineValue) * 10) / 10;
    } else {
      correlations[otherSkill] = Math.round(normalizedOtherScore * 10) / 10;
    }
  }
  return correlations;
}

/**
 * Replays all historical evaluations for a student's skill to dynamically rebuild clean baselines and drift events on edits.
 */
export async function rebuildSkillBaselines(studentId, skillType) {
  const submissions = await ActivitySubmission.find({ studentId }).lean();
  if (submissions.length === 0) {
    await SkillBaseline.deleteOne({ studentId, skillType });
    await DriftEvent.deleteMany({ studentId, skillType });
    return;
  }

  // Get activities to get rubric weights and due dates
  const activityIds = submissions.map(s => s.activityId);
  const activities = await mongoose.model('Activity').find({ _id: { $in: activityIds } }).lean();
  const activitiesMap = new Map(activities.map(a => [a._id.toString(), a]));

  // Sort submissions chronologically by activity due date to preserve the learning trajectory
  const sortedSubmissions = submissions
    .map(sub => ({
      sub,
      activity: activitiesMap.get(sub.activityId.toString())
    }))
    .filter(x => x.activity)
    .sort((a, b) => new Date(a.activity.dueDate) - new Date(b.activity.dueDate));

  // Reset existing baseline and drift metrics for this skill
  await SkillBaseline.deleteOne({ studentId, skillType });
  await DriftEvent.deleteMany({ studentId, skillType });

  let baselineVal = 0;
  let varianceVal = 0;
  let count = 0;

  for (const { sub, activity } of sortedSubmissions) {
    const marksObj = sub.criteriaMarks instanceof Map ? Object.fromEntries(sub.criteriaMarks) : sub.criteriaMarks;
    
    // Match skill type case insensitively
    const matchKey = Object.keys(marksObj).find(k => k.toLowerCase() === skillType.toLowerCase());
    const score = matchKey ? marksObj[matchKey] : null;
    if (score === null || score === undefined) continue;

    const rubric = (activity.rubrics || []).find(
      r => r.criteria && r.criteria.toLowerCase() === skillType.toLowerCase()
    );
    const maxWeight = rubric ? rubric.weight : 100;
    const normalizedScore = maxWeight > 0 ? (score / maxWeight) * 100 : score;

    count++;

    if (count === 1) {
      baselineVal = normalizedScore;
      varianceVal = 0;

      await SkillBaseline.create({
        studentId,
        skillType,
        baselineValue: baselineVal,
        variance: varianceVal,
        activityCount: 1
      });
    } else {
      const threshold = computeAdaptiveThreshold(varianceVal, count - 1);
      const drift = detectDrift(normalizedScore, baselineVal, threshold);

      if (drift.isSignificant) {
        const correlations = await findCorrelatedDriftNormalized(studentId, activity, skillType);
        await DriftEvent.create({
          studentId,
          activityId: activity._id,
          skillType,
          baselineAtDetection: baselineVal,
          observedValue: normalizedScore,
          driftMagnitude: Math.round(drift.magnitude * 10) / 10,
          driftDirection: drift.direction,
          isSignificant: true,
          thresholdUsed: threshold,
          linkedFeedback: sub.feedback || '',
          correlatedSkills: correlations,
        });
      }

      // Update baseline & variance
      const updated = updateBaseline(baselineVal, varianceVal, normalizedScore);
      baselineVal = updated.baseline;
      varianceVal = updated.variance;

      await SkillBaseline.updateOne(
        { studentId, skillType },
        {
          $set: {
            baselineValue: baselineVal,
            variance: varianceVal,
            activityCount: count
          }
        }
      );
    }
  }
}

/**
 * Main pipeline wrapper: Evaluate a single grade for drift and update baselines.
 * Cleans duplicates/stale events automatically.
 */
export async function processNewGrade(studentId, activityId, skillType, newScore, teacherRemark, isEdit = false) {
  try {
    if (isEdit) {
      await rebuildSkillBaselines(studentId, skillType);
      return;
    }

    // Normalize newScore to 100-point scale based on rubric weight
    let normalizedScore = newScore;
    const Activity = mongoose.model('Activity');
    const activity = await Activity.findById(activityId).lean();
    if (activity) {
      const rubric = (activity.rubrics || []).find(
        r => r.criteria && r.criteria.toLowerCase() === skillType.toLowerCase()
      );
      if (rubric && rubric.weight > 0) {
        normalizedScore = (newScore / rubric.weight) * 100;
      }
    }

    let baseline = await SkillBaseline.findOne({ studentId, skillType });
    
    // First time this student is graded on this skill
    if (!baseline) {
      await SkillBaseline.create({
        studentId,
        skillType,
        baselineValue: normalizedScore,
        variance: 0,
        activityCount: 1
      });
      return; // No drift possible on first grade
    }

    const threshold = computeAdaptiveThreshold(baseline.variance, baseline.activityCount);
    const drift = detectDrift(normalizedScore, baseline.baselineValue, threshold);

    if (drift.isSignificant) {
      const correlations = await findCorrelatedDriftNormalized(studentId, activity, skillType);
      
      await DriftEvent.findOneAndUpdate(
        { studentId, activityId, skillType },
        {
          $set: {
            baselineAtDetection: baseline.baselineValue,
            observedValue: normalizedScore,
            driftMagnitude: Math.round(drift.magnitude * 10) / 10,
            driftDirection: drift.direction,
            isSignificant: true,
            thresholdUsed: threshold,
            linkedFeedback: teacherRemark || '',
            correlatedSkills: correlations,
          }
        },
        { upsert: true, new: true }
      );
    } else {
      await DriftEvent.deleteOne({ studentId, activityId, skillType });
    }

    // Update EWMA
    const updated = updateBaseline(baseline.baselineValue, baseline.variance, normalizedScore);
    
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
