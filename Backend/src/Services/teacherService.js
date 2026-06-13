import Class from '../Models/Classmodel.js';
import User from '../Models/Usermodel.js';
import Activity from '../Models/Activitymodel.js';
import ActivitySubmission from '../Models/ActivitySubmissionmodel.js';
import csv from 'csv-parser';
import streamifier from 'streamifier';
import bcrypt from 'bcryptjs';
import cloudinary from '../Config/cloudinary.js';
import { sendWelcomeEmailsInBackground } from '../utils/emailService.js';
import { generateActivityCSV } from '../utils/csvGenerator.js';

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

    // Delete the class
    await Class.findByIdAndDelete(classId);

    // Completely delete the students who were part of this class
    // (If you want to keep the users but unassign them, use updateMany with $unset instead)
    await User.deleteMany({ classId: classId, role: 'student' });

    return true;
}
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

    return true;
};

// Activity Management Services
export const createActivityService = async (teacherId, activityData) => {
    const { title, description, classIds, dueDate, maxPoints, type, rubrics } = activityData;

    // Ensure classIds is an array
    const classIdArray = Array.isArray(classIds) ? classIds : [classIds];

    // Verify all classes exist and belong to teacher
    const classes = await Class.find({ _id: { $in: classIdArray }, teacherId });
    if (classes.length !== classIdArray.length) {
        throw new Error('One or more classes not found or unauthorized');
    }

    const activity = await Activity.create({
        title,
        description,
        teacherId,
        classIds: classIdArray,
        dueDate,
        maxPoints,
        type,
        rubrics
    });

    return activity;
};

export const getActivitiesService = async (teacherId, classId = null) => {
    const query = { teacherId };
    if (classId) query.classIds = classId;

    return await Activity.find(query)
        .populate('classIds', 'name section')
};  

export const getActivitySubmissionsService = async (teacherId, activityId) => {
    const activity = await Activity.findOne({ _id: activityId, teacherId }).populate('classIds', 'name section').lean();
    if (!activity) {
        throw new Error('Activity not found or unauthorized');
    }

    const submissions = await ActivitySubmission.find({ activityId, submittedByTeacher: teacherId })
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

    await ActivitySubmission.deleteMany({ activityId: activityId, submittedByTeacher: teacherId });

    return { message: 'Activity deleted successfully' };
};

export const editActivityMarksService = async (teacherId, activityId, submissionId, updateData, teacherName) => {
    const activity = await Activity.findOne({ _id: activityId, teacherId }).lean();
    if (!activity) throw new Error('Activity not found or unauthorized');

    const submission = await ActivitySubmission.findOne({ _id: submissionId, activityId, submittedByTeacher: teacherId });
    if (!submission) throw new Error('Submission not found or unauthorized');

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
    const activity = await Activity.findOne({ _id: activityId, teacherId }).lean();
    if (!activity) {
        throw new Error('Activity not found or unauthorized');
    }

    const totalSubmissions = await ActivitySubmission.countDocuments({ activityId: activity._id, submittedByTeacher: teacherId });
    const summary = await ActivitySubmission.aggregate([
        { $match: { activityId: activity._id, submittedByTeacher: teacherId } },
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
        { $match: { activityId: activity._id, submittedByTeacher: teacherId } },
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
    const activity = await Activity.findOne({ _id: activityId, teacherId }).populate('classIds', 'name section').lean();
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
    const activity = await Activity.findOne({ _id: activityId, teacherId }).populate('classIds', 'name section').lean();
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
    // 1. Fetch classes for this teacher (optionally filtered by classId)
    let classes;
    if (classId && classId !== 'all') {
        classes = await Class.find({ _id: classId, teacherId }).lean();
    } else {
        classes = await Class.find({ teacherId }).lean();
    }
    const classIds = classes.map(c => c._id);

    // 2. Fetch activities for this teacher (optionally filtered by classId)
    let activities;
    if (classId && classId !== 'all') {
        activities = await Activity.find({ teacherId, classIds: classId }).lean();
    } else {
        activities = await Activity.find({ teacherId }).lean();
    }
    const activityIds = activities.map(a => a._id);

    // 4. Fetch students in these classes
    const students = await User.find({ classId: { $in: classIds }, role: 'student' })
        .select('name email rollNo classId')
        .lean();
    const totalStudentsCount = students.length;
    const studentIds = students.map(s => s._id);

    // 3. Fetch submissions for these activities and students
    const submissions = await ActivitySubmission.find({ 
        activityId: { $in: activityIds },
        studentId: { $in: studentIds },
        submittedByTeacher: teacherId 
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
        d.setHours(0,0,0,0);
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
