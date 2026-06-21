import { loginUserService, forgotPasswordService, resetPasswordService } from '../Services/authService.js';



export const loginUser = async (req, res) => {
    try {
        const { email, password, turnstileToken } = req.body;


        if (process.env.NODE_ENV !== 'test' && process.env.BYPASS_TURNSTILE !== 'true') {
            if (!turnstileToken) {
                return res.status(400).json({ message: 'Security check missing. Please refresh.' });
            }

            const formData = new URLSearchParams();
            formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
            formData.append('response', turnstileToken);

            console.log('Verifying Turnstile with secret:', process.env.TURNSTILE_SECRET_KEY ? 'Present' : 'MISSING');

            const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData
            });

            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
                console.error('Turnstile verification failed:', verifyData);
                return res.status(403).json({
                    message: 'Security check failed. Please try again.',
                    details: verifyData['error-codes'] || []
                });
            }
        }

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
        const { email, turnstileToken } = req.body;

        // Verify Turnstile Token
        if (process.env.NODE_ENV !== 'test' && process.env.BYPASS_TURNSTILE !== 'true') {
            if (!turnstileToken) {
                return res.status(400).json({ message: 'Security check missing. Please refresh.' });
            }

            const turnstileData = new URLSearchParams();
            turnstileData.append('secret', process.env.TURNSTILE_SECRET_KEY);
            turnstileData.append('response', turnstileToken);

            const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: turnstileData
            });

            const verifyData = await verifyResponse.json();
            if (!verifyData.success) {
                console.error('Turnstile verification failed (Forgot Password):', verifyData);
                return res.status(403).json({
                    message: 'Security check failed. Please try again.',
                    details: verifyData['error-codes'] || []
                });
            }
        }

        const result = await forgotPasswordService(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, turnstileToken } = req.body;

        // Verify Turnstile Token
        if (process.env.NODE_ENV !== 'test' && process.env.BYPASS_TURNSTILE !== 'true') {
            if (!turnstileToken) {
                return res.status(400).json({ message: 'Security check missing. Please refresh.' });
            }

            const turnstileData = new URLSearchParams();
            turnstileData.append('secret', process.env.TURNSTILE_SECRET_KEY);
            turnstileData.append('response', turnstileToken);

            const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: turnstileData
            });

            const verifyData = await verifyResponse.json();
            if (!verifyData.success) {
                console.error('Turnstile verification failed (Reset Password):', verifyData);
                return res.status(403).json({
                    message: 'Security check failed. Please try again.',
                    details: verifyData['error-codes'] || []
                });
            }
        }

        const result = await resetPasswordService(email, otp, newPassword);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};