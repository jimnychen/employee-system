const jwt = require('jsonwebtoken');
const env = require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 取得 Bearer <token>

    if (!token) return res.status(401).json({ error: '請先登入' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token 已失效' });
        req.user = user; // 將解碼後的用戶資訊存入 req，後續 API 就能使用
        next();
    });
};
module.exports = {
    authenticateToken
};