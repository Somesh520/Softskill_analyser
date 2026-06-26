import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true } // Can be String (text) or Number (rating)
}, { _id: false });

const surveyResponseSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [answerSchema]
}, {
    timestamps: true
});

// Ensure a student can only submit a response once per survey
surveyResponseSchema.index({ surveyId: 1, studentId: 1 }, { unique: true });

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);
export default SurveyResponse;
