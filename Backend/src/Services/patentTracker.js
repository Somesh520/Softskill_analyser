import mongoose from 'mongoose';
import SkillBaseline from '../Models/SkillBaselineModel.js';
import LearningTrajectory from '../Models/LearningTrajectoryModel.js';
import ActivitySubmission from '../Models/ActivitySubmissionmodel.js';

/**
 * -----------------------------------------------------------------------------------------
 * MATHEMATICAL DESIGN SPECIFICATION - THE TRACKING & CALIBRATION ENGINE
 * -----------------------------------------------------------------------------------------
 * This engine runs a sequence of digital signal processing (DSP) steps on academic
 * grading telemetry. These formulas serve as formal patent claims:
 * 
 * 1. Normalized Grading Vector (NGV):
 *    Ngv(t) = ( RawScore / MaxPoints ) * 100
 * 
 * 2. Exponentially Weighted Moving Average (EWMA) Baseline Calculation:
 *    Baseline(t) = alpha * Ngv(t) + (1 - alpha) * Baseline(t-1)
 *    (Defaults: alpha = 0.3)
 * 
 * 3. Rolling Variance Tracker:
 *    Variance(t) = beta * |Ngv(t) - Baseline(t-1)|^2 + (1 - beta) * Variance(t-1)
 *    (Defaults: beta = 0.3)
 * 
 * 4. Adaptive Chebyshev Significance Threshold:
 *    Threshold(t) = StdDev * ConfidenceFactor
 *    ConfidenceFactor = Max(1.0, 3.0 / Sqrt(ActivityCount))
 * 
 * 5. Learning Velocity (First-Order Difference):
 *    Velocity(t) = Ngv(t) - Ngv(t-1)
 * 
 * 6. Learning Acceleration (Second-Order Difference):
 *    Acceleration(t) = Velocity(t) - Velocity(t-1)
 * 
 * 7. Modification Impact Factor (MIF) for Teacher Edits:
 *    Mif = |Baseline_post_edit - Baseline_pre_edit|
 * -----------------------------------------------------------------------------------------
 */

/**
 * Calculate the complete patentable learning trajectory metrics for a grade update.
 * Logs output to the LearningTrajectory model.
 */
export async function trackStudentTrajectory(studentId, classId, activityId, skillType, rawScore, maxPoints) {
    try {
        const normalizedPercentage = maxPoints > 0 ? (rawScore / maxPoints) * 100 : rawScore;

        // 1. Fetch previous trajectory data point for velocity & acceleration calculations
        const lastTrajectory = await LearningTrajectory.findOne({ studentId, skillType })
            .sort({ createdAt: -1 })
            .lean();

        // 2. Fetch baseline metadata
        let baseline = await SkillBaseline.findOne({ studentId, skillType });
        let previousBaselineValue = 0;
        let prevVariance = 0;
        let activityCount = 1;

        if (baseline) {
            previousBaselineValue = baseline.baselineValue;
            prevVariance = baseline.variance;
            activityCount = baseline.activityCount + 1;
        }

        // 3. Compute new EWMA metrics
        const alpha = 0.3;
        const newBaselineValue = baseline
            ? (alpha * normalizedPercentage + (1 - alpha) * previousBaselineValue)
            : normalizedPercentage;
        
        const deviation = Math.abs(normalizedPercentage - previousBaselineValue);
        const newVarianceValue = baseline
            ? (alpha * (deviation ** 2) + (1 - alpha) * prevVariance)
            : 0;

        // 4. Compute Adaptive Significance Thresholds
        const stdDev = Math.sqrt(newVarianceValue);
        const confidenceFactor = Math.max(1.0, 3.0 / Math.sqrt(activityCount));
        const driftThresholdUsed = Math.max(5.0, Math.min(stdDev * confidenceFactor, 25.0));

        const driftMagnitude = normalizedPercentage - previousBaselineValue;
        const isDriftSignificant = Math.abs(driftMagnitude) > driftThresholdUsed && baseline !== null;
        let driftDirection = 'neutral';
        if (isDriftSignificant) {
            driftDirection = driftMagnitude >= 0 ? 'positive' : 'negative';
        }

        // 5. Compute Velocity and Acceleration
        let learningVelocity = 0;
        let learningAcceleration = 0;
        if (lastTrajectory) {
            learningVelocity = normalizedPercentage - lastTrajectory.normalizedPercentage;
            learningAcceleration = learningVelocity - lastTrajectory.learningVelocity;
        }

        // 6. Cross-Skill Correlation Matrix
        const correlatedImpactMatrix = new Map();
        const otherSubmissions = await ActivitySubmission.findOne({ studentId, activityId }).lean();
        if (otherSubmissions && otherSubmissions.criteriaMarks) {
            const marksObj = otherSubmissions.criteriaMarks instanceof Map 
                ? Object.fromEntries(otherSubmissions.criteriaMarks) 
                : otherSubmissions.criteriaMarks;

            const Activity = mongoose.model('Activity');
            const activity = await Activity.findById(activityId).lean();

            for (const [otherSkill, otherScore] of Object.entries(marksObj)) {
                if (otherSkill.toLowerCase() === skillType.toLowerCase()) continue;

                // Find baseline of other skill to check cross-drift deviation
                const otherBaseline = await SkillBaseline.findOne({ studentId, skillType: otherSkill }).lean();
                const otherRubric = (activity?.rubrics || []).find(r => r.criteria && r.criteria.toLowerCase() === otherSkill.toLowerCase());
                const otherMax = otherRubric ? otherRubric.weight : 100;
                const normalizedOtherScore = otherMax > 0 ? (otherScore / otherMax) * 100 : otherScore;

                if (otherBaseline) {
                    const correlationDelta = normalizedOtherScore - otherBaseline.baselineValue;
                    correlatedImpactMatrix.set(otherSkill, Math.round(correlationDelta * 10) / 10);
                } else {
                    correlatedImpactMatrix.set(otherSkill, Math.round(normalizedOtherScore * 10) / 10);
                }
            }
        }

        // 7. Save trajectory record
        const trajectoryRecord = await LearningTrajectory.create({
            studentId,
            classId,
            activityId,
            skillType,
            rawScore,
            maxPoints,
            normalizedPercentage: Math.round(normalizedPercentage * 10) / 10,
            previousBaseline: Math.round(previousBaselineValue * 10) / 10,
            updatedBaseline: Math.round(newBaselineValue * 10) / 10,
            rollingVariance: Math.round(newVarianceValue * 10) / 10,
            activityCount,
            driftThresholdUsed: Math.round(driftThresholdUsed * 10) / 10,
            driftMagnitude: Math.round(driftMagnitude * 10) / 10,
            driftDirection,
            isDriftSignificant,
            learningVelocity: Math.round(learningVelocity * 10) / 10,
            learningAcceleration: Math.round(learningAcceleration * 10) / 10,
            correlatedImpactMatrix,
            currentScore: Math.round(normalizedPercentage * 10) / 10
        });

        return trajectoryRecord;
    } catch (error) {
        console.error('Trajectory tracking algorithm failure:', error);
    }
}

/**
 * Audit and calculate Modification Impact Factors (MIF) when grades are revised by a teacher.
 */
export async function trackModificationImpact(studentId, classId, activityId, skillType, previousScore, newScore, maxPoints) {
    try {
        const prevNormalized = maxPoints > 0 ? (previousScore / maxPoints) * 100 : previousScore;
        const newNormalized = maxPoints > 0 ? (newScore / maxPoints) * 100 : newScore;

        // Fetch student baselines
        const baseline = await SkillBaseline.findOne({ studentId, skillType });
        if (!baseline) return;

        // Calculate theoretical pre-edit baseline
        const alpha = 0.3;
        const baselineWithoutNewScore = (baseline.baselineValue - alpha * newNormalized) / (1 - alpha);

        // Compute Modification Impact Factor (MIF)
        const MIF = Math.abs(baseline.baselineValue - baselineWithoutNewScore);

        // Update the last trajectory record for audits
        await LearningTrajectory.updateOne(
            { studentId, activityId, skillType },
            {
                $set: {
                    originalScore: Math.round(prevNormalized * 10) / 10,
                    currentScore: Math.round(newNormalized * 10) / 10,
                    modificationImpactFactor: Math.round(MIF * 10) / 10,
                    isRecordModified: true,
                    modifiedAt: new Date()
                }
            }
        );
    } catch (error) {
        console.error('Failed to log modification impact:', error);
    }
}
