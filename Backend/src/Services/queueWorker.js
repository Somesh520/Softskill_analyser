import { receiveFromQueue, deleteFromQueue } from './queueService.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

let isRunning = false;

export const startQueueWorker = () => {
    if (isRunning) {
        console.log("[SQS Worker] Worker is already running.");
        return;
    }

    isRunning = true;
    console.log("[SQS Worker] Started SQS background worker. Polling messages...");

    // Continuous polling loop in the background
    (async () => {
        while (isRunning) {
            try {
                const response = await receiveFromQueue();

                if (response.Messages && response.Messages.length > 0) {
                    console.log(`[SQS Worker] Received ${response.Messages.length} messages to process.`);

                    for (const msg of response.Messages) {
                        try {
                            const student = JSON.parse(msg.Body);
                            const { name, email, plainPassword } = student;

                            if (!email || !name || !plainPassword) {
                                console.warn(`[SQS Worker] Invalid message payload format:`, student);
                                // Delete invalid messages so they don't block the queue
                                await deleteFromQueue(msg.ReceiptHandle);
                                continue;
                            }

                            console.log(`[SQS Worker] Sending welcome email to ${email}...`);
                            const emailSent = await sendWelcomeEmail(email, name, plainPassword);

                            if (emailSent) {
                                console.log(`[SQS Worker] Email sent. Deleting message from SQS: ${msg.MessageId}`);
                                await deleteFromQueue(msg.ReceiptHandle);
                            } else {
                                console.warn(`[SQS Worker] Failed to send email to ${email}. Message kept in SQS to retry.`);
                            }
                        } catch (msgErr) {
                            console.error(`[SQS Worker] Failed to process message ${msg.MessageId}:`, msgErr.message);
                        }
                    }
                }
            } catch (err) {
                console.error("❌ [SQS Worker] Error polling SQS queue:", err.message);
                // Wait 5 seconds before retrying on network/connection failure to avoid CPU spinning
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    })();
};

export const stopQueueWorker = () => {
    isRunning = false;
    console.log("[SQS Worker] Stopped SQS background worker.");
};
