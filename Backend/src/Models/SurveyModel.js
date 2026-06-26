import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['text', 'rating'], required: true },
});

const surveySchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: false
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    questions: [questionSchema],
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Survey = mongoose.model('Survey', surveySchema);
export default Survey;
