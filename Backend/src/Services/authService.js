import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../Models/Usermodel.js';
import { sendEmail } from '../utils/emailService.js';
import { otpTemplate } from '../utils/emailTemplates.js';

export const loginUserService = async (email, password) => {
    // 1. Check for user email (ensuring case-insensitivity)
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // 2. Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    // 3. Generate Access and Refresh Tokens
    const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'superSecretKeyThatNobodyKnows123', 
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + '_refresh' : 'superSecretRefreshTokenKey'),
        { expiresIn: '7d' }
    );

    return {
        user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        accessToken,
        refreshToken
    };
};

export const refreshAccessTokenService = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }

    try {
        const secret = process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET ? process.env.JWT_SECRET + '_refresh' : 'superSecretRefreshTokenKey');
        const decoded = jwt.verify(refreshToken, secret);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.isActive === false) {
            throw new Error('User is inactive');
        }

        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'superSecretKeyThatNobodyKnows123',
            { expiresIn: '1h' }
        );

        return {
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessToken
        };
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

export const forgotPasswordService = async (email) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('User not found with this email');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP (so even db-admins don't see the raw OTP) - Optional but good for security. Let's just store raw for simplicity/learning here, or hash it. We'll store it raw but hashed is better.
    // For this context, standard string match is fine:
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send the email
    const emailHtml = otpTemplate(user.name, otp);
    const emailSent = await sendEmail({
        to: user.email,
        subject: 'Soft Skill Analyser - Password Reset OTP',
        html: emailHtml
    });

    if (!emailSent) {
        // Rollback if email fails
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        throw new Error('Could not send email. Please try again later.');
    }

    return { message: 'OTP sent to your email successfully.' };
};

export const resetPasswordService = async (email, otp, newPassword) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({
        email: normalizedEmail,
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Invalid or expired OTP');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return { message: 'Password has been reset successfully. You can now login.' };
};