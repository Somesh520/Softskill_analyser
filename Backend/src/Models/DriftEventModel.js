import mongoose from 'mongoose';

const driftEventSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
        required: true
    },
    skillType: {
        type: String,
        required: true,
        trim: true
    },
    baselineAtDetection: {
        type: Number,
        required: true
    },
    observedValue: {
        type: Number,
        required: true
    },
    driftMagnitude: {
        type: Number,
        required: true
    },
    driftDirection: {
        type: String,
        enum: ['positive', 'negative'],
        required: true
    },
    isSignificant: {
        type: Boolean,
        required: true,
        default: false
    },
    thresholdUsed: {
        type: Number,
        required: true
    },
    linkedFeedback: {
        type: String,
        default: ''
    },
    correlatedSkills: {
        type: Map,
        of: Number,
        default: {}
    }
}, { timestamps: true });

// Optimize querying for a student's recent drifts
driftEventSchema.index({ studentId: 1, skillType: 1, createdAt: -1 });

const DriftEvent = mongoose.model('DriftEvent', driftEventSchema);
export default DriftEvent;
