import dotenv from 'dotenv';
import { getWelcomeEmailTemplate } from './emailTemplates.js';

dotenv.config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Helper function to send email via Brevo HTTP API with retry logic
const sendBrevoEmail = async (toEmail, subject, htmlContent, retries = 2) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_USER || 'someshtiwari.in@gmail.com';

    if (!apiKey) {
        console.error("⚠️ BREVO_API_KEY is missing in environment variables!");
        return false;
    }

    try {
        const response = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                sender: { name: "Soft Skill Analyzer", email: senderEmail },
                to: [{ email: toEmail }],
                subject: subject,
                htmlContent: htmlContent
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            // If it's a rate limit error (429), retry after a delay
            if (response.status === 429 && retries > 0) {
                console.warn(`⚠️ Rate limited for ${toEmail}. Retrying in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return await sendBrevoEmail(toEmail, subject, htmlContent, retries - 1);
            }
            throw new Error(JSON.stringify(errorData));
        }

        console.log(`✅ Email sent successfully to ${toEmail}`);
        return true;
    } catch (error) {
        if (retries > 0) {
            console.warn(`🔄 Retrying email to ${toEmail} (${retries} left) due to error: ${error.message}`);
            // Exponential backoff: 3s, 6s
            await new Promise(resolve => setTimeout(resolve, (3 - retries) * 3000));
            return await sendBrevoEmail(toEmail, subject, htmlContent, retries - 1);
        }
        console.error(`❌ Failed to send email to ${toEmail} after retries:`, error.message);
        return false;
    }
};

// Sends a single welcome email (Used when creating new students)
export const sendWelcomeEmail = async (email, name, plainPassword) => {
    const subject = 'Welcome to Soft Skill Analyzer - Your Login Details';
    const htmlContent = getWelcomeEmailTemplate(name, email, plainPassword);
    
    return await sendBrevoEmail(email, subject, htmlContent);
};

export const sendWelcomeEmailsInBackground = (newStudents) => {
    // We do NOT await this function. It runs entirely in the background.
    console.log(`[Email Queue] Starting background job to email ${newStudents.length} new students via Brevo...`);

    // Self-executing async function for background processing
    (async () => {
        // Send in smaller batches to prevent socket exhaustion
        const BATCH_SIZE = 3;

        for (let i = 0; i < newStudents.length; i += BATCH_SIZE) {
            const batch = newStudents.slice(i, i + BATCH_SIZE);

            // Wait for this chunk to send
            await Promise.all(batch.map(student =>
                sendWelcomeEmail(student.email, student.name, student.plainPassword)
            ));

            // Wait 3 seconds between batches for Brevo safety
            if (i + BATCH_SIZE < newStudents.length) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        console.log(`[Email Queue] Finished emailing ${newStudents.length} students via Brevo.`);
    })();
};

// Generic email sender (Used for admin creating teachers, etc)
export const sendEmail = async ({ to, subject, html }) => {
    return await sendBrevoEmail(to, subject, html);
};