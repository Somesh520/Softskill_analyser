import Class from '../Models/Classmodel.js';
import User from '../Models/Usermodel.js';
import csv from 'csv-parser';
import streamifier from 'streamifier';
import bcrypt from 'bcryptjs';
import cloudinary from '../Config/cloudinary.js';
import { sendWelcomeEmailsInBackground } from '../utils/emailService.js';

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
    return await Class.find({ teacherId }).sort({ createdAt: -1 });
};

export const getClassDetailsService = async (teacherId, classId) => {
    const classObj = await Class.findOne({ _id: classId, teacherId });
    if (!classObj) {
        throw new Error('Class not found or you do not have permission to view it.');
    }

    const students = await User.find({ classId, role: 'student' }).select('-password');

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

    // Optionally: Unassign students from this class
    await User.updateMany(
        { classId: classId },
        { $unset: { classId: 1, assignedByTeacher: 1 } }
    );

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

    return true;
};