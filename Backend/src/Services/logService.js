import Log from '../Models/Logmodel.js';

export const createLogService = async (teacherId, action, details) => {
    try {
        await Log.create({
            teacherId,
            action,
            details
        });
    } catch (error) {
        console.error('Failed to create log:', error.message);
        // We don't throw the error because we don't want a failing log to break the main transaction
    }
};
