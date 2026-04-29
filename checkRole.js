const checkRole = (roles) => {
    return (req, res, next) => {
        // req.user 是從之前的 authenticateToken 中解析出來的
        if (!req.user) {
            return res.status(401).json({ error: '未授權' });
        }

        if (roles.includes(req.user.role)) {
            next(); // 角色符合，繼續執行下一個動作
        } else {
            res.status(403).json({ error: '權限不足，拒絕存取' });
        }
    };
};
module.exports = { checkRole };