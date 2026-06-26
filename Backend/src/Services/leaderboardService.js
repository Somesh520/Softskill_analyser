import ActivitySubmission from '../Models/ActivitySubmissionmodel.js';
import User from '../Models/Usermodel.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const getLeaderboardService = async (limit = 20) => {
    try {
        const leaderboard = await ActivitySubmission.aggregate([
            {
                $group: {
                    _id: '$studentId',
                    avgScore: { $avg: '$totalMarks' },
                    totalActivities: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            { $match: { 'studentInfo.role': 'student', 'studentInfo.isActive': true } },
            {
                $project: {
                    _id: 1,
                    name: '$studentInfo.name',
                    email: '$studentInfo.email',
                    rollNo: '$studentInfo.rollNo',
                    avgScore: { $round: ['$avgScore', 2] },
                    totalActivities: 1
                }
            },
            { $sort: { avgScore: -1 } },
            { $limit: Number(limit) }
        ]);

        return leaderboard;
    } catch (error) {
        throw new Error('Failed to fetch leaderboard: ' + error.message);
    }
};

export const getLeaderboardInsightsService = async (topStudents) => {
    try {
        if (!topStudents || topStudents.length === 0) {
            return "No data available to generate insights.";
        }

        const top3 = topStudents.slice(0, 3).map((s, i) => `${i + 1}. ${s.name} (Avg: ${s.avgScore}%)`).join(', ');

        const prompt = `You are an AI Analyst for a college soft-skills tracking platform. 
Here are the top students on the leaderboard right now: ${top3}. 
Write a very short (2-3 sentences), highly encouraging, and professional summary of the current standings. 
Make it sound dynamic, like a sports commentator but professional. Mention the top student by name.
Do not use markdown like asterisks or bold text, just plain text.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 100,
        });

        return chatCompletion.choices[0]?.message?.content || "The competition is fierce! Keep working on your soft skills to reach the top.";
    } catch (error) {
        console.error("Groq AI Error:", error);
        return "The competition is fierce! Keep working on your soft skills to reach the top. (AI Insights currently unavailable)";
    }
};
