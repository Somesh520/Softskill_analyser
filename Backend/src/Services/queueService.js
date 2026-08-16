import {
    SendMessageCommand,
    ReceiveMessageCommand,
    DeleteMessageCommand,
    SendMessageBatchCommand
} from "@aws-sdk/client-sqs";

import sqs from "../Config/sqs.js";
import { sendWelcomeEmailsInBackground } from "../utils/emailService.js";

const QUEUE_URL = process.env.SQS_QUEUE_URL;

export const sendBatchToQueue = async (messages) => {
    if (!messages || messages.length === 0) return [];

    // SQS SendMessageBatch supports up to 10 messages per request
    const chunks = [];
    for (let i = 0; i < messages.length; i += 10) {
        chunks.push(messages.slice(i, i + 10));
    }

    const results = [];
    for (const chunk of chunks) {
        const entries = chunk.map((msg, index) => ({
            Id: `msg_${Date.now()}_${index}_${Math.floor(Math.random() * 10000)}`,
            MessageBody: JSON.stringify(msg)
        }));

        const command = new SendMessageBatchCommand({
            QueueUrl: QUEUE_URL,
            Entries: entries
        });

        const result = await sqs.send(command);
        results.push(result);
    }
    return results;
};


export const queueWelcomeEmails = (newStudents) => {
    if (!newStudents || newStudents.length === 0) return;

    if (QUEUE_URL) {
        // Run asynchronously in the background (DO NOT AWAIT)
        (async () => {
            try {
                console.log(`[Queue Service] Queueing ${newStudents.length} welcome emails to SQS...`);
                await sendBatchToQueue(newStudents);
                console.log(`[Queue Service] Successfully queued welcome emails to SQS.`);
            } catch (err) {
                console.error("❌ Error queueing welcome emails to SQS, falling back to direct Brevo SMTP sending:", err.message);
                sendWelcomeEmailsInBackground(newStudents);
            }
        })();
    } else {
        console.log(`[Queue Service] SQS_QUEUE_URL not configured. Sending welcome emails directly via Brevo...`);
        sendWelcomeEmailsInBackground(newStudents);
    }
};

export const sendToQueue = async (data) => {
    const command = new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(data)
    });

    const result = await sqs.send(command);

    console.log("Message queued:", result.MessageId);

    return result.MessageId;
};

export const receiveFromQueue = async () => {
    const command = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20
    });

    return await sqs.send(command);
};

export const deleteFromQueue = async (receiptHandle) => {
    const command = new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: receiptHandle
    });

    await sqs.send(command);
};