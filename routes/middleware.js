const { JWT_SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(411).json({msg:"Auth header not found"})
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        
        if (decoded.userId) {
    
            req.userId = decoded.userId;
            next();
        } else {
            return res.status(403).json({msg: "Verification Failed"})
        }
    }
    catch (err) {
        return res.status(403).json(
            {msg:"Authentication Failed"}
        )
    }
}

module.exports = {
    authMiddleware
}