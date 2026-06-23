const adminAuth = (req, res, next) => {
    // Check for authorization header or custom header
    const authHeader = req.headers['authorization'] || req.headers['x-admin-secret'];
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized: Missing Admin Secret key.' });
    }

    // Support standard Bearer format if sent that way, or direct comparison
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (token !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ message: 'Unauthorized: Invalid Admin Secret key.' });
    }

    next();
};

module.exports = adminAuth;
