import { SQSClient } from "@aws-sdk/client-sqs";

const clientConfig = {
    region: process.env.AWS_REGION || "ap-south-1"
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN })
    };
}

const sqs = new SQSClient(clientConfig);

export default sqs;