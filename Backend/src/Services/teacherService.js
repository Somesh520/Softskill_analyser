import Class from '../Models/Classmodel.js';
import User from '../Models/Usermodel.js';
import Activity from '../Models/Activitymodel.js';
import ActivitySubmission from '../Models/ActivitySubmissionmodel.js';
import Survey from '../Models/SurveyModel.js';
import SurveyResponse from '../Models/SurveyResponseModel.js';
import { sendWelcomeEmailsInBackground } from '../utils/emailService.js';
import Groq from 'groq-sdk';
import csv from 'csv-parser';
import { getStudentDashboardSummaryService } from './studentService.js';
import streamifier from 'streamifier';
import bcrypt from 'bcryptjs';
import cloudinary from '../Config/cloudinary.js';
import { generateActivityCSV } from '../utils/csvGenerator.js';
import { createLogService } from './logService.js';
import groq from '../Config/groq.js'

const reportsSummaryCache = new Map();
const CACHE_TTL = 15000; // 15 seconds TTL

export const clearReportsSummaryCache = () => {
    reportsSummaryCache.clear();
};

const normalizeHeader = (header) => header?.trim().toLowerCase();

const getRowValue = (row, candidates) => {
    const keys = Object.keys(row);
    const matchedKey = keys.find((key) => candidates.some((candidate) => key.includes(candidate)));
    return matchedKey ? row[matchedKey] : undefined;
};

export const createClassService = async (teacherId, classData) => {
    const { name, program, branch, semester, section, academicYear } = classData;

    // Check if this teacher already has this exact class
    const classExists = await Class.findOne({
        name,
        program,
        branch,
        semester,
        section,
        academicYear,
        teacherId
    });

    if (classExists) {
        throw new Error('You have already created this class for this semester and year.');
    }

    // Create the standard class
    const newClass = await Class.create({
        name,
        program,
        branch,
        semester,
        section,
        academicYear,
        teacherId
    });

    clearReportsSummaryCache();
    await createLogService(teacherId, 'CREATED_CLASS', `Created class: ${name} (Sem ${semester})`);
    return newClass;
};

export const getClassesService = async (teacherId) => {
    // Return all classes sorted by newest first
    return await Class.find({ teacherId }).sort({ createdAt: -1 }).lean();
};

export const getClassDetailsService = async (teacherId, classId) => {
    const classObj = await Class.findOne({ _id: classId, teacherId }).lean();
    if (!classObj) {
        throw new Error('Class not found or you do not have permission to view it.');
    }

    const students = await User.find({ classId, role: 'student' }).select('name email rollNo semester classId').lean();

    return {
        classDetails: classObj,
        students
    };
};

export const assignTeacherService = async (teacherId, studentId, classId) => {
    // 1. Check if the class exists and belongs to this teacher
    const classObj = await Class.findOne({ _id: classId, teacherId });
    if (!classObj) {
        throw new Error('Class not found or you do not have permission to assign students to this class.');
    }

    // 3. Update the student (User) with class assignment and semester
    const student = await User.findOneAndUpdate(
        { _id: studentId, role: 'student' },
        {
            classId: classObj._id,
            semester: classObj.semester,
            assignedByTeacher: teacherId
        },
        { new: true }
    );

    if (!student) {
        throw new Error('Student not found.');
    }

    await createLogService(teacherId, 'ASSIGNED_STUDENT', `Assigned student ${student.name} to class ${classObj.name}`);

    return {
        classId: classObj._id,
        className: classObj.name,
        semester: classObj.semester,
        studentId: student._id,
        studentName: student.name,
        message: `Student assigned to ${classObj.name} (Semester ${classObj.semester}) successfully`
    };
};

export const uploadStudentCsvService = async (teacherId, classId, fileBuffer) => {
    // 1. Verify class belongs to teacher
    const classObj = await Class.findOne({ _id: classId, teacherId });
    if (!classObj) {
        throw new Error('Class not found or unauthorized');
    }

    // 2. Upload raw CSV to Cloudinary (as backup/audit)
    const cloudinaryUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: `teachers/${teacherId}/classes/${classId}` },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });

    // 3. Parse CSV from buffer
    const students = [];
    await new Promise((resolve, reject) => {
        streamifier.createReadStream(fileBuffer)
            .pipe(csv({
                mapHeaders: ({ header }) => header.trim().toLowerCase()
            }))
            .on('data', (data) => {
                // Ultra-fuzzy matching: Find keys that contain our target words
                const keys = Object.keys(data);
                const nameKey = keys.find(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('student'));
                const emailKey = keys.find(k => k.toLowerCase().includes('mail'));
                const rollNoKey = keys.find(k => k.toLowerCase().includes('roll'));

                const name = nameKey ? data[nameKey] : undefined;
                const email = emailKey ? data[emailKey] : undefined;
                const rollNo = rollNoKey ? data[rollNoKey] : undefined;

                if (email && name && rollNo) {
                    students.push({
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                        rollNo: rollNo.trim()
                    });
                } else {
                    console.warn("Skipped row due to missing data. Raw row:", data);
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });

    if (students.length === 0) {
        throw new Error('No valid student data found. Please ensure CSV has name, email, and rollNo headers.');
    }

    // 4. Find existing users to know who is new
    const emailList = students.map(s => s.email);
    const existingUsers = await User.find({ email: { $in: emailList } }).select('email');
    const existingEmails = new Set(existingUsers.map(u => u.email));

    const newStudentsToEmail = [];

    // 5. Process BulkWrite Upserts
    const bulkOps = await Promise.all(students.map(async (student) => {
        let passwordToSet;

        if (!existingEmails.has(student.email)) {
            // Generate a secure random 8-character password for new students
            const plainPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            passwordToSet = await bcrypt.hash(plainPassword, salt);

            // Queue for emailing
            newStudentsToEmail.push({
                name: student.name,
                email: student.email,
                plainPassword
            });
        }

        return {
            updateOne: {
                filter: { email: student.email },
                update: {
                    $set: {
                        name: student.name,
                        rollNo: student.rollNo,
                        classId: classObj._id,
                        semester: classObj.semester,
                        assignedByTeacher: teacherId
                    },
                    ...(passwordToSet && {
                        $setOnInsert: {
                            password: passwordToSet,
                            role: 'student',
                            isActive: true
                        }
                    })
                },
                upsert: true // Insert if they don't exist
            }
        };
    }));

    const result = await User.bulkWrite(bulkOps);

    // 6. Trigger background email sending (DO NOT AWAIT)
    if (newStudentsToEmail.length > 0) {
        sendWelcomeEmailsInBackground(newStudentsToEmail);
    }

    await createLogService(teacherId, 'UPLOADED_STUDENTS_CSV', `Uploaded CSV adding/updating ${result.upsertedCount + result.modifiedCount} students in class ${classObj.name}`);

    return {
        message: `CSV processed successfully. Uploaded to Cloudinary backup.`,
        cloudinaryUrl,
        stats: {
            totalParsed: students.length,
            upsertedCount: result.upsertedCount,
            modifiedCount: result.modifiedCount
        }
    };
};

export const deleteClassService = async (teacherId, classId) => {
    // Check if the class exists and belongs to the teacher
    const classObj = await Class.findOne({ _id: classId, teacherId });
    if (!classObj) {
        throw new Error('Class not found or you are not authorized to delete it.');
    }

    // 1. Get list of student IDs in this class before deleting them
    const students = await User.find({ classId: classId, role: 'student' }).select('_id').lean();
    const studentIds = students.map(s => s._id);

    // 2. Delete the class
    await Class.findByIdAndDelete(classId);

    // 3. Delete the student users
    await User.deleteMany({ classId: classId, role: 'student' });

    // 4. Delete submissions of these deleted students
    if (studentIds.length > 0) {
        await ActivitySubmission.deleteMany({ studentId: { $in: studentIds } });
    }

    // 5. Pull this classId from all activities' classIds array
    await Activity.updateMany(
        { classIds: classId },
        { $pull: { classIds: classId } }
    );

    // 6. Delete activities that no longer have any classes assigned to them (orphaned activities)
    const orphanedActivities = await Activity.find({ classIds: { $size: 0 } }).select('_id').lean();
    const orphanedActivityIds = orphanedActivities.map(a => a._id);

    if (orphanedActivityIds.length > 0) {
        await Activity.deleteMany({ _id: { $in: orphanedActivityIds } });
        await ActivitySubmission.deleteMany({ activityId: { $in: orphanedActivityIds } });
    }

    clearReportsSummaryCache();
    await createLogService(teacherId, 'DELETED_CLASS', `Deleted class: ${classObj.name} (Sem ${classObj.semester})`);
    return true;
};
export const deleteStudentFromClassService = async (teacherId, classId, studentId) => {
    // Ensure the class belongs to this teacher
    const classObj = await Class.findOne({ _id: classId, teacherId });
    if (!classObj) {
        throw new Error('Class not found or you are not authorized.');
    }

    // Unassign or delete the student (Here we completely delete the student account)
    const deletedStudent = await User.findOneAndDelete({ _id: studentId, classId: classId });

    if (!deletedStudent) {
        throw new Error('Student not found in this class.');
    }

    await createLogService(teacherId, 'DELETED_STUDENT', `Removed student ${deletedStudent.name} from class ${classObj.name}`);

    return true;
};

// Activity Management Services
export const createActivityService = async (teacherId, activityData) => {
    const { title, description, classIds, dueDate, maxPoints, type, rubrics, appointedTeacherId } = activityData;


    // Ensure classIds is an array
    const classIdArray = Array.isArray(classIds) ? classIds : [classIds];

    // Verify all classes exist and belong to teacher
    const classes = await Class.find({ _id: { $in: classIdArray }, teacherId });
    if (classes.length !== classIdArray.length) {
        throw new Error('One or more classes not found or unauthorized');
    }

    // Verify appointed teacher exists if it's an Interview
    if (type === 'Interview' && appointedTeacherId) {
        const appointedTeacher = await User.findOne({ _id: appointedTeacherId, role: 'teacher' });
        if (!appointedTeacher) {
            throw new Error('Appointed teacher not found');
        }
    }

    const system_prompt = 'your job is to give title and description of activity based on the user description. Return ONLY a JSON object with "newtitle" and "newdescription" keys. No markdown, no extra text.';

    const aiResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            { role: 'system', content: system_prompt },
            { role: 'user', content: description }
        ],
        response_format: { type: 'json_object' }
    });

    const response = JSON.parse(aiResponse.choices[0].message.content);
    const { newtitle, newdescription } = response;
    if (!newtitle || !newdescription) {
        throw new Error('Failed to generate title and description from AI');
    }


    const activity = await Activity.create({
        title: newtitle || title,
        description: newdescription || description,
        teacherId,
        classIds: classIdArray,
        dueDate,
        maxPoints,
        type,
        rubrics,
        appointedTeacherId: type === 'Interview' ? appointedTeacherId : undefined
    });


    clearReportsSummaryCache();
    await createLogService(teacherId, 'CREATED_ACTIVITY', `Created activity: ${title} (${type})`);
    return activity;
};

export const getActivitiesService = async (teacherId, classId = null) => {
    const query = {
        $or: [
            { teacherId },
            { appointedTeacherId: teacherId }
        ]
    };
    if (classId) query.classIds = classId;

    return await Activity.find(query)
        .populate('classIds', 'name section')
        .populate('teacherId', 'name email deptName')
        .populate('appointedTeacherId', 'name email deptName')
        .sort({ createdAt: -1 });
};

export const getActivitySubmissionsService = async (teacherId, activityId) => {
    const activity = await Activity.findOne({
        _id: activityId,
        $or: [
            { teacherId },
            { appointedTeacherId: teacherId }
        ]
    }).populate('classIds', 'name section').lean();

    if (!activity) {
        throw new Error('Activity not found or unauthorized');
    }

    const submissions = await ActivitySubmission.find({ activityId })
        .select('studentName rollNo email criteriaMarks totalMarks feedback updatedAt studentId editHistory')
        .sort({ updatedAt: -1 })
        .lean();

    return {
        activity: {
            _id: activity._id,
            title: activity.title,
            maxPoints: activity.maxPoints,
            classNames: activity.classIds?.map(c => c.name).join(', ') || ''
        },
        rubrics: (activity.rubrics || []).map((rubric) => rubric.criteria),
        submissions: submissions.map((submission) => ({
            _id: submission._id,
            studentName: submission.studentName,
            rollNo: submission.rollNo,
            email: submission.email,
            criteriaMarks: submission.criteriaMarks || {},
            totalMarks: submission.totalMarks,
            feedback: submission.feedback,
            updatedAt: submission.updatedAt,
            studentId: submission.studentId,
            editHistory: submission.editHistory || []
        }))
    };
};

export const deleteActivityService = async (teacherId, activityId) => {
    const activity = await Activity.findOneAndDelete({ _id: activityId, teacherId }).lean();

    if (!activity) {
        throw new Error('Activity not found or unauthorized');
    }

    await ActivitySubmission.deleteMany({ activityId: activityId });

    clearReportsSummaryCache();
    await createLogService(teacherId, 'DELETED_ACTIVITY', `Deleted activity: ${activity.title}`);
    return { message: 'Activity deleted successfully' };
};

export const editActivityMarksService = async (teacherId, activityId, submissionId, updateData, teacherName) => {
    const activity = await Activity.findOne({
        _id: activityId,
        $or: [
            { teacherId },
            { appointedTeacherId: teacherId }
        ]
    }).lean();
    if (!activity) throw new Error('Activity not found or unauthorized');

    const submission = await ActivitySubmission.findOne({ _id: submissionId, activityId });
    if (!submission) throw new Error('Submission not found');

    const { criteriaMarks, feedback } = updateData;

    // Calculate new total marks
    let newTotalMarks = 0;
    const newCriteriaMarks = {};
    if (criteriaMarks) {
        for (const [criterion, mark] of Object.entries(criteriaMarks)) {
            const numMark = Number(mark);
            const safeMark = Number.isFinite(numMark) ? numMark : 0;
            newCriteriaMarks[criterion] = safeMark;
            newTotalMarks += safeMark;
        }
    }

    // Build change history
    const changes = {};
    if (criteriaMarks) {
        for (const [criterion, newValue] of Object.entries(newCriteriaMarks)) {
            const oldValue = submission.criteriaMarks?.get?.(criterion) ?? submission.criteriaMarks?.[criterion] ?? 0;
            if (oldValue !== newValue) {
                changes[criterion] = { oldValue, newValue };
            }
        }
        if (submission.totalMarks !== newTotalMarks) {
            changes.totalMarks = { oldValue: submission.totalMarks, newValue: newTotalMarks };
        }
    }
    if (feedback !== undefined && submission.feedback !== feedback) {
        changes.feedback = { oldValue: submission.feedback, newValue: feedback };
    }

    // Only add to history if there are actual changes
    if (Object.keys(changes).length > 0) {
        if (!submission.editHistory) submission.editHistory = [];
        submission.editHistory.push({
            editedByTeacherId: teacherId,
            editedByTeacherName: teacherName,
            editedAt: new Date(),
            changes
        });
    }

    // Update submission with new marks and feedback
    if (criteriaMarks) submission.criteriaMarks = newCriteriaMarks;
    if (criteriaMarks) submission.totalMarks = newTotalMarks;
    if (feedback !== undefined) submission.feedback = feedback;

    await submission.save();

    clearReportsSummaryCache();
    await createLogService(teacherId, 'EDITED_MARKS', `Edited marks for student ${submission.studentName} in activity ${activity.title}`);
    return {
        message: 'Marks updated successfully',
        submission: {
            _id: submission._id,
            studentName: submission.studentName,
            criteriaMarks: submission.criteriaMarks,
            totalMarks: submission.totalMarks,
            feedback: submission.feedback,
            editHistory: submission.editHistory
        }
    };
};

export const getActivityAnalyticsService = async (teacherId, activityId) => {
    const activity = await Activity.findOne({
        _id: activityId,
        $or: [
            { teacherId },
            { appointedTeacherId: teacherId }
        ]
    }).lean();
    if (!activity) {
        throw new Error('Activity not found or unauthorized');
    }

    const totalSubmissions = await ActivitySubmission.countDocuments({ activityId: activity._id });
    const summary = await ActivitySubmission.aggregate([
        { $match: { activityId: activity._id } },
        {
            $group: {
                _id: null,
                avgMarks: { $avg: '$totalMarks' },
                maxMarks: { $max: '$totalMarks' },
                minMarks: { $min: '$totalMarks' }
            }
        }
    ]);

    const distribution = await ActivitySubmission.aggregate([
        { $match: { activityId: activity._id } },
        {
            $bucket: {
                groupBy: '$totalMarks',
                boundaries: [0, 20, 40, 60, 80, 101],
                default: 'other',
                output: { count: { $sum: 1 } }
            }
        }
    ]);

    return {
        activityId: activity._id,
        title: activity.title,
        maxPoints: activity.maxPoints,
        totalSubmissions,
        summary: summary[0] || { avgMarks: 0, maxMarks: 0, minMarks: 0 },
        distribution
    };
};

export const downloadActivityTemplateService = async (teacherId, activityId) => {
    const activity = await Activity.findOne({
        _id: activityId,
        $or: [
            { teacherId },
            { appointedTeacherId: teacherId }
        ]
    }).populate('classIds', 'name section').lean();
    if (!activity) throw new Error('Activity not found or unauthorized');

    // For multi-class, use first class for student extraction
    const classId = activity.classIds?.[0]?._id || activity.classIds?.[0];
    const students = await User.find({ classId, role: 'student' })
        .select('name email rollNo')
        .lean();

    const csvContent = generateActivityCSV(activity, students);
    return {
        filename: `template_${activity.title.replace(/\s+/g, '_')}.csv`,
        content: csvContent
    };
};

export const uploadActivityMarksService = async (teacherId, activityId, fileBuffer) => {
    const activity = await Activity.findOne({
        _id: activityId,
        $or: [
            { teacherId },
            { appointedTeacherId: teacherId }
        ]
    }).populate('classIds', 'name section').lean();
    if (!activity) throw new Error('Activity not found or unauthorized');

    // For multi-class, use first class for student extraction
    const classId = activity.classIds?.[0]?._id || activity.classIds?.[0];
    const students = await User.find({ classId, role: 'student' })
        .select('name email rollNo')
        .lean();
    const studentsByRollNo = new Map(students.filter((student) => student.rollNo).map((student) => [String(student.rollNo).trim().toLowerCase(), student]));
    const studentsByEmail = new Map(students.filter((student) => student.email).map((student) => [String(student.email).trim().toLowerCase(), student]));

    const rubricCriteria = (activity.rubrics || []).map((rubric) => rubric.criteria).filter(Boolean);
    const uploadedRows = [];

    return new Promise((resolve, reject) => {
        streamifier.createReadStream(fileBuffer)
            .pipe(csv({ mapHeaders: ({ header }) => normalizeHeader(header) }))
            .on('data', (data) => uploadedRows.push(data))
            .on('end', async () => {
                try {
                    const bulkOps = [];
                    let skipped = 0;

                    for (const row of uploadedRows) {
                        const rollNo = String(getRowValue(row, ['roll no', 'rollno', 'roll']) || '').trim().toLowerCase();
                        const email = String(getRowValue(row, ['email', 'mail']) || '').trim().toLowerCase();
                        const studentName = String(getRowValue(row, ['name', 'student']) || '').trim();
                        const feedback = String(getRowValue(row, ['overall feedback', 'feedback']) || '').trim();

                        const student = studentsByRollNo.get(rollNo) || studentsByEmail.get(email);
                        if (!student) {
                            skipped += 1;
                            continue;
                        }

                        const criteriaMarks = {};
                        let totalMarks = 0;

                        for (const criterion of rubricCriteria) {
                            const criterionKey = normalizeHeader(criterion);
                            const rawMark = row[criterionKey];
                            const numericMark = Number(rawMark);
                            const safeMark = Number.isFinite(numericMark) ? numericMark : 0;
                            criteriaMarks[criterion] = safeMark;
                            totalMarks += safeMark;
                        }

                        bulkOps.push({
                            updateOne: {
                                filter: { activityId: activity._id, studentId: student._id },
                                update: {
                                    $set: {
                                        activityId: activity._id,
                                        studentId: student._id,
                                        studentName: studentName || student.name,
                                        rollNo: student.rollNo || rollNo,
                                        email: student.email,
                                        criteriaMarks,
                                        totalMarks,
                                        feedback,
                                        submittedByTeacher: teacherId,
                                        sourceFileName: ''
                                    }
                                },
                                upsert: true
                            }
                        });
                    }

                    const bulkWriteChunkSize = 500;
                    let written = 0;
                    for (let i = 0; i < bulkOps.length; i += bulkWriteChunkSize) {
                        const chunk = bulkOps.slice(i, i + bulkWriteChunkSize);
                        if (chunk.length > 0) {
                            await ActivitySubmission.bulkWrite(chunk, { ordered: false });
                            written += chunk.length;
                        }
                    }

                    clearReportsSummaryCache();
                    await createLogService(teacherId, 'UPLOADED_MARKS_CSV', `Uploaded marks CSV for activity ${activity.title}, processed ${written} students`);
                    resolve({
                        message: `Processed ${written} students`,
                        count: written,
                        skipped
                    });
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', reject);
    });
};

export const getTeacherReportsSummaryService = async (teacherId, classId = null) => {
    const cacheKey = `${teacherId}_${classId || 'all'}`;
    const cached = reportsSummaryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }

    // 1. Fetch activities for this teacher (optionally filtered by classId)
    // Activities where creator or appointed evaluator
    const activityQuery = {
        $or: [
            { teacherId },
            { appointedTeacherId: teacherId }
        ]
    };
    if (classId && classId !== 'all') {
        activityQuery.classIds = classId;
    }
    const activities = await Activity.find(activityQuery).lean();
    const activityIds = activities.map(a => a._id);

    // 2. Fetch classes for this teacher
    const activityClassIds = activities.reduce((acc, act) => {
        if (act.classIds) {
            act.classIds.forEach(id => acc.add(String(id)));
        }
        return acc;
    }, new Set());

    let classes;
    if (classId && classId !== 'all') {
        classes = await Class.find({ _id: classId }).lean();
    } else {
        classes = await Class.find({
            $or: [
                { teacherId },
                { _id: { $in: Array.from(activityClassIds) } }
            ]
        }).lean();
    }
    const classIds = classes.map(c => c._id);

    // 3. Fetch students in these classes
    const students = await User.find({ classId: { $in: classIds }, role: 'student' })
        .select('name email rollNo classId')
        .lean();
    const totalStudentsCount = students.length;
    const studentIds = students.map(s => s._id);

    // 4. Fetch submissions for these activities and students
    const submissions = await ActivitySubmission.find({
        activityId: { $in: activityIds },
        studentId: { $in: studentIds }
    }).lean();

    // 5. Calculate stats
    const totalActivities = activities.length;
    const totalClasses = classId && classId !== 'all' ? 1 : classes.length;
    const totalSubmissions = submissions.length;

    let totalMarksSum = 0;
    submissions.forEach(sub => {
        totalMarksSum += (sub.totalMarks || 0);
    });
    const avgScore = totalSubmissions > 0 ? Math.round((totalMarksSum / totalSubmissions) * 10) / 10 : 0;

    // 6. Activity performance: for each activity, calculate avg, high, low, submitted
    const activityPerformance = activities.map(activity => {
        const actSubmissions = submissions.filter(sub => String(sub.activityId) === String(activity._id));
        const count = actSubmissions.length;
        let avg = 0;
        let highest = 0;
        let lowest = count > 0 ? 999999 : 0;
        let sum = 0;

        actSubmissions.forEach(sub => {
            const marks = sub.totalMarks || 0;
            sum += marks;
            if (marks > highest) highest = marks;
            if (marks < lowest) lowest = marks;
        });

        if (count > 0) {
            avg = Math.round((sum / count) * 10) / 10;
        } else {
            lowest = 0;
        }

        return {
            id: activity._id,
            name: activity.title,
            avg,
            students: count,
            submitted: count,
            highest,
            lowest,
            dueDate: activity.dueDate,
            type: activity.type
        };
    });

    // 7. Class or Student Performance Comparison
    let classPerformance = [];
    if (classId && classId !== 'all') {
        // If specific class is selected, compare students in this class
        classPerformance = students.map(student => {
            const studentSubmissions = submissions.filter(sub => String(sub.studentId) === String(student._id));
            const count = studentSubmissions.length;
            let sum = 0;
            let avg = 0;

            studentSubmissions.forEach(sub => {
                sum += (sub.totalMarks || 0);
            });

            if (count > 0) {
                avg = Math.round((sum / count) * 10) / 10;
            }

            return {
                name: student.name,
                avg,
                students: count // number of activities submitted by this student
            };
        });

        // Sort by average descending (best performing first)
        classPerformance.sort((a, b) => b.avg - a.avg);
        // Limit to top 12 to fit nicely on the chart, but don't limit if there are few
        if (classPerformance.length > 12) {
            classPerformance = classPerformance.slice(0, 12);
        }
    } else {
        // Otherwise, compare class averages
        classPerformance = classes.map(cls => {
            const clsStudents = students.filter(s => String(s.classId) === String(cls._id));
            const clsStudentIds = new Set(clsStudents.map(s => String(s._id)));

            const clsSubmissions = submissions.filter(sub => clsStudentIds.has(String(sub.studentId)));
            const count = clsSubmissions.length;
            let sum = 0;
            let avg = 0;

            clsSubmissions.forEach(sub => {
                sum += (sub.totalMarks || 0);
            });

            if (count > 0) {
                avg = Math.round((sum / count) * 10) / 10;
            }

            return {
                name: `${cls.name} (${cls.section || 'A'})`,
                avg,
                students: clsStudents.length
            };
        });
    }

    // 8. Scoring Trend: Group by calendar week based on submission date (updatedAt)
    const sortedSubmissions = [...submissions].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

    const getWeekLabel = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const weeklyGroups = {};
    sortedSubmissions.forEach(sub => {
        const label = getWeekLabel(sub.updatedAt);
        if (!weeklyGroups[label]) {
            weeklyGroups[label] = [];
        }
        weeklyGroups[label].push(sub.totalMarks || 0);
    });

    const scoringTrend = Object.keys(weeklyGroups).map(weekLabel => {
        const marksList = weeklyGroups[weekLabel];
        const sum = marksList.reduce((a, b) => a + b, 0);
        const avg = Math.round((sum / marksList.length) * 10) / 10;
        const high = Math.max(...marksList);
        const low = Math.min(...marksList);
        return {
            week: weekLabel,
            avg,
            high,
            low
        };
    });

    // 9. Criteria distribution and top criteria
    const criteriaSums = {};
    const criteriaCounts = {};
    submissions.forEach(sub => {
        if (sub.criteriaMarks) {
            const marksObj = sub.criteriaMarks instanceof Map ? Object.fromEntries(sub.criteriaMarks) : sub.criteriaMarks;
            for (const [criterion, score] of Object.entries(marksObj)) {
                if (score !== undefined && score !== null) {
                    criteriaSums[criterion] = (criteriaSums[criterion] || 0) + Number(score);
                    criteriaCounts[criterion] = (criteriaCounts[criterion] || 0) + 1;
                }
            }
        }
    });

    const criteriaBreakdown = [];
    let topCriterion = { name: 'None', avg: 0, count: 0 };

    for (const criterion of Object.keys(criteriaSums)) {
        const sum = criteriaSums[criterion];
        const count = criteriaCounts[criterion];
        const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

        criteriaBreakdown.push({
            name: criterion.charAt(0).toUpperCase() + criterion.slice(1),
            value: avg,
            count
        });

        if (avg > topCriterion.avg) {
            topCriterion = {
                name: criterion.charAt(0).toUpperCase() + criterion.slice(1),
                avg,
                count
            };
        }
    }

    const totalAvgSum = criteriaBreakdown.reduce((sum, item) => sum + item.value, 0);
    criteriaBreakdown.forEach(item => {
        item.percentage = totalAvgSum > 0 ? Math.round((item.value / totalAvgSum) * 100) : 0;
    });

    // 10. Completion rate
    let totalExpectedSubmissions = 0;
    activities.forEach(activity => {
        const activityClassIds = activity.classIds.map(id => String(id));
        const activityStudents = students.filter(s => activityClassIds.includes(String(s.classId)));
        totalExpectedSubmissions += activityStudents.length;
    });

    const completionRate = totalExpectedSubmissions > 0
        ? Math.round((totalSubmissions / totalExpectedSubmissions) * 100)
        : 0;

    // 11. Improvement calculation
    let improvementValue = 0;
    let improvementLabel = 'N/A';
    if (scoringTrend.length >= 2) {
        const firstWeek = scoringTrend[0];
        const lastWeek = scoringTrend[scoringTrend.length - 1];
        improvementValue = Math.round((lastWeek.avg - firstWeek.avg) * 10) / 10;
        improvementLabel = `From ${firstWeek.week} to ${lastWeek.week}`;
    } else if (scoringTrend.length === 1) {
        improvementLabel = `Single week data: ${scoringTrend[0].week}`;
    }

    return {
        stats: {
            totalActivities,
            totalClasses,
            avgScore,
            totalSubmissions,
            totalStudents: totalStudentsCount
        },
        activityPerformance,
        classPerformance,
        scoringTrend,
        criteriaBreakdown,
        completionRate: {
            rate: completionRate,
            submitted: totalSubmissions,
            expected: totalExpectedSubmissions
        },
        improvement: {
            value: improvementValue,
            label: improvementLabel
        },
        topCriterion
    };

    reportsSummaryCache.set(cacheKey, {
        timestamp: Date.now(),
        data: result
    });

    return result;
};

export const addStudentManuallyService = async (teacherId, classId, studentData) => {
    const { name, email, rollNo } = studentData;

    // 1. Verify class belongs to teacher
    const classObj = await Class.findOne({ _id: classId, teacherId });
    if (!classObj) {
        throw new Error('Class not found or unauthorized');
    }

    // 2. Check if user already exists with this email or roll number
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRollNo = String(rollNo).trim().toLowerCase();

    const studentExists = await User.findOne({
        $or: [
            { email: normalizedEmail },
            { rollNo: normalizedRollNo }
        ]
    });

    if (studentExists) {
        throw new Error('Student already exist');
    }

    // 3. Set standard student password
    const plainPassword = 'Student@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    // 4. Create new student user
    const newStudent = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        rollNo: String(rollNo).trim(),
        classId: classObj._id,
        semester: classObj.semester,
        assignedByTeacher: teacherId,
        password: passwordHash,
        role: 'student',
        isActive: true
    });

    // 5. Send welcome email (DO NOT AWAIT)
    sendWelcomeEmailsInBackground([{
        name: newStudent.name,
        email: newStudent.email,
        plainPassword
    }]);

    await createLogService(teacherId, 'ADDED_STUDENT_MANUALLY', `Manually added student ${newStudent.name} to class ${classObj.name}`);

    return {
        message: 'Student added successfully',
        student: {
            _id: newStudent._id,
            name: newStudent.name,
            email: newStudent.email,
            rollNo: newStudent.rollNo,
            semester: newStudent.semester
        }
    };
};

export const getTeachersService = async () => {
    return await User.find({ role: 'teacher' }).select('name email deptName').sort({ name: 1 }).lean();
};

export const updateStudentPlacementService = async (teacherId, classId, studentId, placementData) => {
    // Verify the class belongs to this teacher
    const classObj = await Class.findOne({ _id: classId, teacherId });
    if (!classObj) {
        throw new Error('Class not found or unauthorized');
    }

    // Verify the student is in this class
    const student = await User.findOne({ _id: studentId, classId, role: 'student' });
    if (!student) {
        throw new Error('Student not found in this class');
    }

    // Update placement details
    student.placement = { ...student.placement, ...placementData };
    await student.save();

    await createLogService(teacherId, 'UPDATED_STUDENT_PLACEMENT', `Updated placement details for student ${student.name} in class ${classObj.name}`);

    return {
        message: 'Placement details updated successfully',
        student: {
            _id: student._id,
            name: student.name,
            placement: student.placement
        }
    };
};

export const getStudentReportByTeacherService = async (teacherId, classId, studentId) => {
    // Verify the class belongs to this teacher
    const classObj = await Class.findOne({ _id: classId, teacherId });
    if (!classObj) {
        throw new Error('Class not found or unauthorized');
    }

    // Verify the student is in this class
    const student = await User.findOne({ _id: studentId, classId, role: 'student' });
    if (!student) {
        throw new Error('Student not found in this class');
    }

    // Call the student service to get the dashboard summary
    return await getStudentDashboardSummaryService(studentId);
};

