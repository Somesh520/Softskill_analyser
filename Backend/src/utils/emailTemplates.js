export const teacherWelcomeTemplate = (name, email, password) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/login`;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #000; text-transform: uppercase;">Welcome, ${name}!</h2>
            <p style="font-size: 16px;">An Admin has created an account for you on the <strong>Soft Skill Analyser</strong> platform.</p>
            <div style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #FF00FF; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;">Here are your login credentials:</p>
                <p style="margin: 0 0 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #00FF00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 16px; border: 3px solid #000; box-shadow: 4px 4px 0px #000; display: inline-block; text-transform: uppercase;">
                    Login to your account
                </a>
            </div>
            <p style="color: #d9534f; font-size: 14px;"><em>*Please log in and change your password as soon as possible for security reasons.</em></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">If you did not expect this email, please contact the administrator.</p>
        </div>
    `;
};

export const otpTemplate = (name, otp) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #000; text-transform: uppercase;">Password Reset Request</h2>
            <p style="font-size: 16px;">Hello ${name},</p>
            <p style="font-size: 16px;">We received a request to reset your password for the <strong>Soft Skill Analyser</strong>.</p>
            <div style="background-color: #f8f8f8; padding: 15px; border-left: 4px solid #FF00FF; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px;">Your One-Time Password (OTP) is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${otp}</div>
            </div>
            <p style="color: #d9534f; font-size: 14px;"><em>*This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</em></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">Soft Skill Analyser automated system.</p>
        </div>
    `;
};

export const getWelcomeEmailTemplate = (name, email, plainPassword) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 2px solid #000; box-shadow: 6px 6px 0px #000;">
            <h2 style="color: #FF00FF; text-transform: uppercase; font-weight: 900; font-size: 24px;">Welcome, ${name}!</h2>
            <p style="font-size: 16px; font-weight: bold;">You have been enrolled in a new class on the <strong>Soft Skill Analyzer</strong> platform.</p>
            <p style="font-size: 16px;">Here are your temporary login details:</p>
            <div style="background-color: #f8f8f8; padding: 15px; border-left: 6px solid #00FFFF; border-top: 2px solid #000; border-right: 2px solid #000; border-bottom: 2px solid #000; margin: 20px 0; box-shadow: 4px 4px 0px #000;">
                <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 8px 0 0 0; font-size: 16px;"><strong>Password:</strong> <span style="background-color: #FFEB3B; padding: 2px 6px; border: 1px solid #000; font-family: monospace;">${plainPassword}</span></p>
            </div>
            <p style="color: red; font-size: 14px; font-weight: bold; text-transform: uppercase;">Please login and change your password immediately.</p>
            <p style="font-size: 14px; font-weight: bold;">Best Regards,<br>The Soft Skill Analyzer Team</p>
        </div>
    `;
};
