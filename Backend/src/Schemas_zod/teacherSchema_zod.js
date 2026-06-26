import { z } from 'zod';

export const createClassSchema = z.object({
    name: z.string().min(1, "Class name is required"),
    program: z.string().min(1, "Program is required"),
    branch: z.string().min(1, "Branch is required"),
    semester: z.coerce.number().int().positive("Semester must be a positive integer"),
    section: z.string().min(1, "Section is required"),
    academicYear: z.string().min(1, "Academic year is required")
});

export const assignTeacherSchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
    classId: z.string().min(1, "Class ID is required")
});

export const createActivitySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    classIds: z.union([z.string(), z.array(z.string())]),
    dueDate: z.string().or(z.date()),
    maxPoints: z.coerce.number().int().nonnegative("Max points must be a non-negative integer"),
    type: z.string().min(1, "Type is required"),
    rubrics: z.array(z.object({
        criteria: z.string().min(1, "Criteria is required"),
        points: z.coerce.number().nonnegative()
    })).optional(),
    appointedTeacherId: z.string().optional()
});

export const addStudentManuallySchema = z.object({
    name: z.string().min(1, "Student name is required"),
    email: z.string().email("Invalid email format"),
    rollNo: z.string().min(1, "Roll number is required")
});
