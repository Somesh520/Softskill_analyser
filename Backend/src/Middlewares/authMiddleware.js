import jwt from 'jsonwebtoken';

// 1. Middleware to verify if the user is logged in
export const verifyToken = (req, res, next) => {
    let token;
    
    // Check if token is in the Authorization header
    let authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    try {
        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded payload (like userId and role) to the request
        next();
    } catch (error) {
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