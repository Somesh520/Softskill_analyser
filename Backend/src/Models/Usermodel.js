
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Only need unique: true here, Mongoose handles the index automatically
        match: [/.+@kiet\.edu$/, 'Please use a valid @kiet.edu email address']
    },
    password: { // Using 'password' here as you wrote, though project.md calls it passwordHash. We will hash it later!
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        required: true
    },
    


  
    isActive: { 
        type: Boolean, 
        default: true 
    },

    // --- Teacher-specific fields ---
    assignedByAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deptName: {
        type: String
    },

    // --- Student-specific fields ---
    assignedByTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    semester: {
        type: Number
    },
    rollNo: {
        type: String
    },

    // --- Password Reset Fields ---
    resetPasswordOTP: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, { timestamps: true });

// --- Indexes for Fast Search ---
// These ensure MongoDB finds records instantly instead of scanning the whole database
userSchema.index({ role: 1 }); // Fast filtering by admin, teacher, or student
userSchema.index({ assignedByAdmin: 1 }); // Fast query when Admin wants a list of their Teachers
userSchema.index({ assignedByTeacher: 1 }); // Fast query when Teacher wants a list of their Students
userSchema.index({ classId: 1 }); // Fast query to find all students in a specific class
userSchema.index({ rollNo: 1 }); // Fast search for a student by their Roll Number (useful during CSV upload)

const User = mongoose.model('User', userSchema);

export default User;
