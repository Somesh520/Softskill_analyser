import { z } from 'zod';

export const addTeacherSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    deptName: z.array(z.enum([
        "B.Pharma",
        "mechatronics",
        "CSE",
        "CSE AI",
        "CSE-AIML",
        "CS",
        "CSE-CYBER SECURITY",
        "CSE- DATA SCIENCE",
        "IT",
        "CSIT",
        "ECE",
        "ECE- VLSI",
        "EEE",
        "ELCE",
        "ME",
        "AMIA (Advanced Mechatronics and Industrial Automation)",
        "MBA",
        "MCA"
    ], {
        errorMap: () => ({ message: "Invalid department name" })
    })).min(1, "Select at least one department")
});
