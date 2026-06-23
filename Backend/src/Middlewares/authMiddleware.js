import jwt from 'jsonwebtoken';

// 1. Middleware to verify if the user is logged in
export const verifyToken = (req, res, next) => {
    let token = req.cookies?.accessToken;
    
    // Fallback: Check if token is in the Authorization header
    if (!token) {
        let authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    try {
        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'superSecretKeyThatNobodyKnows123');
        req.user = decoded; // Attach the decoded payload (like userId and role) to the request
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'TokenExpiredError', expired: true });
        }
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// 2. Middleware to check if the user has the correct role (Admin, Teacher, Student)
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied: You do not have the required permission' });
        }
        next();
    };
};