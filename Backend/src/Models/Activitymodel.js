import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Activity title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Activity description is required']
    },
    type: {
        type: String,
        enum: ['Assessment', 'Presentation', 'Group Discussion', 'Role Play', 'Writing Task', 'Other'],
        default: 'Assessment'
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    }],
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    maxPoints: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Completed'],
        default: 'Active'
    },
    rubrics: [{
        criteria: String,
        weight: Number // Percentage or points
    }]
}, {
    timestamps: true
});

// Indexes for faster teacher activity reads and dashboard timelines
ActivitySchema.index({ teacherId: 1, classIds: 1 });
ActivitySchema.index({ teacherId: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', ActivitySchema);

export default Activity;