import bcrypt from 'bcryptjs';
import User from '../Models/Usermodel.js';
import { sendEmail } from '../utils/emailService.js';
import { teacherWelcomeTemplate } from '../utils/emailTemplates.js';

export const addTeacherService = async (adminId, name, email, password, deptName) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
        throw new Error('A user with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTeacher = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'teacher',
        assignedByAdmin: adminId,
        deptName
    });

    const emailHtml = teacherWelcomeTemplate(name, normalizedEmail, password);
    sendEmail({
        to: normalizedEmail,
        subject: 'Welcome to Soft Skill Analyser - Your Teacher Account',
        html: emailHtml
    }).catch(err => {
        console.error('Failed to send welcome email to teacher in background:', err);
    });

    return {
        _id: newTeacher._id,
        name: newTeacher.name,
        email: newTeacher.email,
        role: newTeacher.role,
        deptName: newTeacher.deptName
    };
};

export const getAllTeachersService = async () => {
    return await User.find({ role: 'teacher' }).select('-password').sort({ createdAt: -1 });
};

export const getAllStudentsService = async () => {
    return await User.find({ role: 'student' })
        .select('-password')
        .populate('assignedByTeacher', 'name email')  // Show which teacher assigned them
        .populate('classId', 'name semester')          // Show class name & semester
        .sort({ createdAt: -1 });
};