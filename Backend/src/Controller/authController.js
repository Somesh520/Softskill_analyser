import { loginUserService, forgotPasswordService, resetPasswordService } from '../Services/authService.js';



export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Let the Service handle the business logic
        const result = await loginUserService(email, password);
        
        res.status(200).json(result);
    } catch (error) {
        // Return 401 Unauthorized for bad login
        res.status(401).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await forgotPasswordService(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await resetPasswordService(email, otp, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};