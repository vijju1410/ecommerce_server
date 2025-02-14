const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateUser = (req, res, next) => {
    // Get token from headers
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ Message: "No token, authorization denied" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add decoded user information to request object
        req.user = decoded;

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(400).json({ Message: "Invalid token" });
    }
};

module.exports = authenticateUser;
