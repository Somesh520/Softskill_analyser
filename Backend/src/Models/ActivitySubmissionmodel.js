import mongoose from 'mongoose';

const activitySubmissionSchema = new mongoose.Schema({
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    rollNo: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    criteriaMarks: {
        type: Map,
        of: Number,
        default: {}
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ''
    },
    submittedByTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sourceFileName: {
        type: String,
        default: ''
    },
    editHistory: [{
        editedByTeacherId: mongoose.Schema.Types.ObjectId,
        editedByTeacherName: String,
        editedAt: { type: Date, default: Date.now },
        changes: mongoose.Schema.Types.Mixed // { criterion: { oldValue, newValue }, totalMarks: { oldValue, newValue }, feedback: { oldValue, newValue } }
    }]
}, { timestamps: true });

activitySubmissionSchema.index({ activityId: 1, studentId: 1 }, { unique: true });
activitySubmissionSchema.index({ activityId: 1, rollNo: 1 });
activitySubmissionSchema.index({ submittedByTeacher: 1, activityId: 1, updatedAt: -1 });
activitySubmissionSchema.index({ activityId: 1, totalMarks: -1 });

const ActivitySubmission = mongoose.model('ActivitySubmission', activitySubmissionSchema);

export default ActivitySubmission;