import bcrypt from 'bcryptjs';
import User from '../Models/Usermodel.js';
import { sendEmail } from '../utils/emailService.js';
import { teacherWelcomeTemplate } from '../utils/emailTemplates.js';

export const addTeacherService = async (adminId, name, email, password, deptName) => {
    // 1. Check if user already exists
    const normalizedEmail = email?.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
        throw new Error('A user with this email already exists');
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the Teacher user
    const newTeacher = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'teacher',
        assignedByAdmin: adminId, // This links the teacher strictly to the admin
        deptName
    });

    // 4. Send the introductory email with credentials
    // Follows Dependency Injection/SOLID by passing the generated template HTML into the generic sender
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