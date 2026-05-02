import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    program: {
        type: String, // e.g., B.Tech, MBA
        required: true,
        trim: true
    },
    branch: {
        type: String, // e.g., CSE, IT
        required: true,
        trim: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8 
    },
    section: {
        type: String, // e.g., A, B, C
        required: true,
        trim: true
    },
    academicYear: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}$/, 'Please use a valid academic year format like "2024-25"']
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

classSchema.index({ teacherId: 1 });
classSchema.index({ program: 1, branch: 1, semester: 1, section: 1, academicYear: 1 });

const Class = mongoose.model('Class', classSchema);

export default Class;
