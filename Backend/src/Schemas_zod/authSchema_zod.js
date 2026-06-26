import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    turnstileToken: z.string().optional()
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
    turnstileToken: z.string().optional()
});

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().min(1, "OTP is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    turnstileToken: z.string().optional()
});
