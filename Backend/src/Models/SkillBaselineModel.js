import mongoose from 'mongoose';

const skillBaselineSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillType: {
        type: String,
        required: true,
        trim: true
    },
    baselineValue: {
        type: Number,
        required: true,
        default: 0
    },
    variance: {
        type: Number,
        required: true,
        default: 0
    },
    activityCount: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

// Ensure one baseline per student per skill
skillBaselineSchema.index({ studentId: 1, skillType: 1 }, { unique: true });

const SkillBaseline = mongoose.model('SkillBaseline', skillBaselineSchema);
export default SkillBaseline;
