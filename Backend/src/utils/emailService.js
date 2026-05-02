import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getWelcomeEmailTemplate } from './emailTemplates.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Sends a single welcome email
export const sendWelcomeEmail = async (email, name, plainPassword) => {
    try {
        const mailOptions = {
            from: `"Soft Skill Analyzer" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Soft Skill Analyzer - Your Login Details',
            html: getWelcomeEmailTemplate(name, email, plainPassword)
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error.message);
        return false;
    }
};


export const sendWelcomeEmailsInBackground = (newStudents) => {
    // We do NOT await this function. It runs entirely in the background.
    console.log(`[Email Queue] Starting background job to email ${newStudents.length} new students...`);

    // Self-executing async function for background processing
    (async () => {
        // Send in batches of 5 to avoid Gmail rate limits
        const BATCH_SIZE = 5;

        for (let i = 0; i < newStudents.length; i += BATCH_SIZE) {
            const batch = newStudents.slice(i, i + BATCH_SIZE);

            // Wait for this chunk of 5 to send before moving to the next
            await Promise.all(batch.map(student =>
                sendWelcomeEmail(student.email, student.name, student.plainPassword)
            ));

            // Wait 2 seconds between batches to be safe
            if (i + BATCH_SIZE < newStudents.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log(`[Email Queue] Finished emailing ${newStudents.length} students.`);
    })();
};

// SOLID Principle: Single Responsibility - This function ONLY sends emails, it doesn't build templates
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully: " + info.response);
        return true;
    } catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
};