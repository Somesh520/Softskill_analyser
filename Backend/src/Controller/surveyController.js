import Survey from '../Models/SurveyModel.js';
import SurveyResponse from '../Models/SurveyResponseModel.js';
import User from '../Models/Usermodel.js';
import { createLogService } from '../Services/logService.js';
import groq from '../Config/groq.js'




// --- TEACHER ACTIONS ---

// @desc    Create a new survey
// @route   POST /api/surveys/teacher
// @access  Private (Teacher)
export const createSurvey = async (req, res) => {
    try {
        const { classId, isGlobal, title, description, questions, isActive } = req.body;

        const newSurvey = new Survey({
            teacherId: req.user.id,
            classId: isGlobal ? null : classId,
            isGlobal: isGlobal || false,
            title,
            description,
            questions,
            isActive: isActive || false
        });

        await newSurvey.save();
        res.status(201).json(newSurvey);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate survey questions using AI
// @route   POST /api/surveys/teacher/generate
// @access  Private (Teacher)
export const generateSurveyQuestions = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) return res.status(400).json({ message: "Topic is required" });

        const prompt = `You are an expert educational designer. A teacher needs a student feedback survey for the following topic: "${topic}".
        Generate exactly 4 survey questions. Provide a mix of 'rating' (1-5 stars) and 'text' (short answer) questions.
        Return ONLY a valid JSON object with a "questions" key containing the array. Do not include markdown formatting or backticks.
        Format: {"questions": [{"id": "q1", "text": "Question text here", "type": "rating"}, {"id": "q2", "text": "Question text here", "type": "text"}]}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 300,
            response_format: { type: 'json_object' } // Or force JSON parse if standard output
        });

        let content = chatCompletion.choices[0]?.message?.content || "[]";
        // Sometimes LLM wraps json in ```json ... ```
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        let questions = JSON.parse(content);
        if (!Array.isArray(questions) && questions.questions) {
            questions = questions.questions;
        }

        res.status(200).json({ questions });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Failed to generate AI questions: " + error.message });
    }
};

// @desc    Get all surveys created by the teacher
// @route   GET /api/surveys/teacher
// @access  Private (Teacher)
export const getTeacherSurveys = async (req, res) => {
    try {
        const surveys = await Survey.find({ teacherId: req.user.id }).populate('classId', 'branch semester section').sort({ createdAt: -1 });

        // Append response counts
        const surveysWithCounts = await Promise.all(surveys.map(async (survey) => {
            const count = await SurveyResponse.countDocuments({ surveyId: survey._id });
            return { ...survey.toObject(), responseCount: count };
        }));

        res.status(200).json(surveysWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all surveys in the system
// @route   GET /api/surveys/admin
// @access  Private (Admin)
export const getAllSurveys = async (req, res) => {
    try {
        const surveys = await Survey.find()
            .populate('classId', 'branch semester section')
            .populate('teacherId', 'name')
            .sort({ createdAt: -1 });

        const surveysWithCounts = await Promise.all(surveys.map(async (survey) => {
            const count = await SurveyResponse.countDocuments({ surveyId: survey._id });
            return { ...survey.toObject(), responseCount: count };
        }));

        res.status(200).json(surveysWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Survey Publish Status
// @route   PUT /api/surveys/teacher/:id/toggle
// @access  Private (Teacher)
export const toggleSurveyStatus = async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) return res.status(404).json({ message: "Survey not found" });

        // Ensure teacher owns this survey
        if (survey.teacherId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this survey" });
        }
        const newStatus = !survey.isActive;
        survey.isActive = newStatus;
        await survey.save();

        res.status(200).json({ message: `Survey marked as ${newStatus ? 'LIVE' : 'DRAFT'}`, survey });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a survey and its responses
// @route   DELETE /api/surveys/teacher/:id OR /api/surveys/admin/:id
// @access  Private (Teacher, Admin)
export const deleteSurvey = async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }

        // Verify ownership if it's a teacher trying to delete
        if (req.user.role === 'teacher' && survey.teacherId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this survey" });
        }

        await Survey.findByIdAndDelete(req.params.id);
        await SurveyResponse.deleteMany({ surveyId: req.params.id });

        // Log the action
        await createLogService(
            req.user.id,
            'SURVEY_DELETED',
            `Deleted survey: ${survey.title}`
        );

        res.status(200).json({ message: "Survey deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Survey Responses
// @route   GET /api/surveys/teacher/:id/responses
// @access  Private (Teacher)
export const getSurveyResponses = async (req, res) => {
    try {
        const responses = await SurveyResponse.find({ surveyId: req.params.id }).populate('studentId', 'name rollNo');
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- STUDENT ACTIONS ---

// @desc    Get all active surveys for the student's class
// @route   GET /api/surveys/student
// @access  Private (Student)
export const getStudentSurveys = async (req, res) => {
    try {
        // Find the student's class
        const student = await User.findById(req.user.id);
        if (!student.classId) return res.status(400).json({ message: "Student is not assigned to any class" });

        // Find active surveys for this class OR global surveys
        const activeSurveys = await Survey.find({
            $or: [
                { classId: student.classId, isActive: true },
                { isGlobal: true, isActive: true }
            ]
        }).populate('teacherId', 'name role');

        // Find which surveys the student has already submitted
        const submittedResponses = await SurveyResponse.find({ studentId: req.user.id }).select('surveyId');
        const submittedIds = submittedResponses.map(r => r.surveyId.toString());

        // Attach boolean
        const result = activeSurveys.map(survey => ({
            ...survey.toObject(),
            isSubmitted: submittedIds.includes(survey._id.toString())
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit Survey Response
// @route   POST /api/surveys/student/:id
// @access  Private (Student)
export const submitSurvey = async (req, res) => {
    try {
        const { answers } = req.body;
        const surveyId = req.params.id;

        // Check if survey exists and is active
        const survey = await Survey.findById(surveyId);
        if (!survey || !survey.isActive) {
            return res.status(400).json({ message: "Survey is not available" });
        }

        // Check if already submitted
        const existing = await SurveyResponse.findOne({ surveyId, studentId: req.user.id });
        if (existing) {
            return res.status(400).json({ message: "You have already submitted this survey" });
        }

        const newResponse = new SurveyResponse({
            surveyId,
            studentId: req.user.id,
            answers
        });

        await newResponse.save();
        res.status(201).json({ message: "Survey submitted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
