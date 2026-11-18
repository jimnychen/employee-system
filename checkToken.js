const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User } = require('./models');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 取得 Bearer <token>

    if (!token) return res.redirect('/login.html');

    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.redirect('/login.html');
    }
    if (!payload || !payload.id) return res.redirect('/login.html');

    try {
        const user = await User.findByPk(payload.id, { attributes: ['id', 'role'] });
        if (!user) return res.redirect('/login.html');

        req.user = { id: user.id, role: user.role };
        next();
    } catch (error) {
        console.error('JWT 使用者驗證失敗:', error);
        res.status(500).json({ error: '無法驗證使用者' });
    }
};
module.exports = {
    authenticateToken
};