import { loginUserService, forgotPasswordService, resetPasswordService, refreshAccessTokenService } from '../Services/authService.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../Schemas_zod/authSchema_zod.js';



export const loginUser = async (req, res) => {
    try {
        const { email, password, turnstileToken } = loginSchema.parse(req.body);


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
        const { user, accessToken, refreshToken } = result;

        // Set Access Token cookie (1 hour)
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 3600000 // 1 hour
        });

        // Set Refresh Token cookie (7 days)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 3600 * 1000 // 7 days
        });

        if (process.env.NODE_ENV === 'test') {
            res.status(200).json({
                ...user,
                token: accessToken
            });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        // Return 401 Unauthorized for bad login
        res.status(401).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ message: 'Refresh token missing' });
        }

        const result = await refreshAccessTokenService(token);
        const { user, accessToken } = result;

        // Set Access Token cookie (1 hour)
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json(user);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email, turnstileToken } = forgotPasswordSchema.parse(req.body);

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
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(400).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, turnstileToken } = resetPasswordSchema.parse(req.body);

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
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(400).json({ message: error.message });
    }
};