const jwt = require("jsonwebtoken");

// Middleware to authenticate token from cookies or Authorization header
const authenticateToken = (req, res, next) => {
    // Check token in cookies first
    let token = req.cookies.token;
    
    // If not in cookies, check Authorization header
    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ 
            status: "Error",
            message: "Unauthorized" 
        });
    }

    try {
        const decoded = jwt.verify(token, "bookstore123");
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                status: "Error",
                message: "Token expired. Please sign in again." 
            });
        }
        return res.status(403).json({ 
            status: "Error",
            message: "Invalid token. Please sign in again." 
        });
    }
};

module.exports = { authenticateToken };
