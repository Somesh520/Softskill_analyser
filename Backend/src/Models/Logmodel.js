import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Index for fast fetching and sorting
logSchema.index({ createdAt: -1 });
logSchema.index({ teacherId: 1 });

const Log = mongoose.model('Log', logSchema);

export default Log;
