import mongoose from 'mongoose';

const learningTrajectorySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true,
        index: true
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
        required: true
    },
    skillType: {
        type: String,
        required: true
    },
    // Raw & Normalized Scores
    rawScore: { type: Number, required: true },
    maxPoints: { type: Number, required: true },
    normalizedPercentage: { type: Number, required: true },

    // Historical Baselines
    previousBaseline: { type: Number, default: 0 },
    updatedBaseline: { type: Number, required: true },
    rollingVariance: { type: Number, default: 0 },
    activityCount: { type: Number, default: 1 },

    // Drift Detection (Chebyshev Threshold)
    driftThresholdUsed: { type: Number, required: true },
    driftMagnitude: { type: Number, required: true },
    driftDirection: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
    isDriftSignificant: { type: Boolean, default: false },

    // Learning Metrics
    learningVelocity: { type: Number, default: 0 }, // Rate of change relative to previous score
    learningAcceleration: { type: Number, default: 0 }, // Rate of change of learning velocity

    // Cross-Skill Correlation Vector
    correlatedImpactMatrix: {
        type: Map,
        of: Number, // SkillType -> Correlation value
        default: {}
    },

    // Teacher Edit Auditing Metrics
    originalScore: { type: Number, required: false },
    currentScore: { type: Number, required: true },
    modificationImpactFactor: { type: Number, default: 0 }, // How much teacher edits changed the baseline (delta baseline)
    isRecordModified: { type: Boolean, default: false },
    modifiedAt: { type: Date, required: false }
}, {
    timestamps: true
});

// Compound indexes for fast historical queries
learningTrajectorySchema.index({ studentId: 1, skillType: 1, createdAt: 1 });
learningTrajectorySchema.index({ studentId: 1, classId: 1, skillType: 1 });

const LearningTrajectory = mongoose.model('LearningTrajectory', learningTrajectorySchema);
export default LearningTrajectory;
