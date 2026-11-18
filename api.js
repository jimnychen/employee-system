const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, AttendanceRecord, Request } = require('./models');
const { Op } = require('sequelize');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const saltRounds = 10;
const allowedRoles = ['admin', 'manager', 'employee'];

// 角色檢查
const checkRole = require('./checkRole.js').checkRole;
// token 驗證
const authenticateToken = require('./checkToken.js').authenticateToken;

router.get('/', (req, res) => {
    res.send('Hello, this is system API!');   
});

// 登入
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: '帳號不存在' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('登入嘗試:', { username, password, isMatch });
        if (!isMatch) {
            return res.status(401).json({ error: '密碼錯誤' });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );
        res.status(200).json({
            message: '登入成功',
            token: token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: '伺服器錯誤: ' + error.message });
    }
});

// 使用者管理（僅管理員）
router.get('/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'name', 'role', 'createdAt'],
            order: [['id', 'ASC']]
        });
        res.status(200).json({ data: users });
    } catch (error) {
        console.error('取得使用者列表失敗:', error);
        res.status(500).json({ error: '無法取得使用者列表' });
    }
});

router.post('/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { username, password, name, role } = req.body || {};
    if (typeof username !== 'string' || !username.trim() ||
        typeof password !== 'string' || !password ||
        typeof role !== 'string' || !allowedRoles.includes(role)) {
        return res.status(400).json({ error: '請提供帳號、密碼與有效的使用者權限' });
    }

    try {
        const user = await User.create({
            username: username.trim(),
            password: await bcrypt.hash(password, saltRounds),
            name: typeof name === 'string' ? name.trim() : '',
            role
        });
        res.status(201).json({
            message: '使用者新增成功',
            data: { id: user.id, username: user.username, name: user.name, role: user.role }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: '此帳號已存在' });
        }
        console.error('新增使用者失敗:', error);
        res.status(500).json({ error: '新增使用者失敗' });
    }
});

router.put('/users/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const userId = Number(req.params.id);
    const { username, password, name, role } = req.body || {};
    if (!Number.isInteger(userId) || userId <= 0 ||
        typeof username !== 'string' || !username.trim() ||
        typeof role !== 'string' || !allowedRoles.includes(role) ||
        (name !== undefined && typeof name !== 'string') ||
        (password !== undefined && typeof password !== 'string')) {
        return res.status(400).json({ error: '使用者資料無效' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: '使用者不存在' });
        }
        if (user.id === req.user.id && role !== 'admin') {
            return res.status(400).json({ error: '不能移除自己的管理員權限' });
        }
        if (user.role === 'admin' && role !== 'admin') {
            const otherAdmins = await User.count({
                where: { role: 'admin', id: { [Op.ne]: user.id } }
            });
            if (otherAdmins === 0) {
                return res.status(400).json({ error: '系統至少需要一位管理員' });
            }
        }

        user.username = username.trim();
        user.name = typeof name === 'string' ? name.trim() : user.name;
        user.role = role;
        if (password) {
            user.password = await bcrypt.hash(password, saltRounds);
        }
        await user.save();

        res.status(200).json({
            message: '使用者資料已更新',
            data: { id: user.id, username: user.username, name: user.name, role: user.role }
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: '此帳號已存在' });
        }
        console.error('更新使用者失敗:', error);
        res.status(500).json({ error: '更新使用者失敗' });
    }
});

router.delete('/users/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: '使用者 ID 無效' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: '使用者不存在' });
        }
        if (user.id === req.user.id) {
            return res.status(400).json({ error: '不能刪除目前登入的管理員帳號' });
        }
        if (user.role === 'admin') {
            const otherAdmins = await User.count({
                where: { role: 'admin', id: { [Op.ne]: user.id } }
            });
            if (otherAdmins === 0) {
                return res.status(400).json({ error: '系統至少需要一位管理員' });
            }
        }

        await user.destroy();
        res.status(200).json({ message: '使用者已刪除' });
    } catch (error) {
        console.error('刪除使用者失敗:', error);
        res.status(500).json({ error: '刪除使用者失敗' });
    }
});

// 1. 上班打卡
router.post('/clockIN', authenticateToken, checkRole(['employee', 'manager', 'admin']), async (req, res) => {
    try {
        const record = await AttendanceRecord.create({
            employeeId: req.user.id,
            clockInTime: new Date(),
            status: 'IN'
        });
        res.status(201).json({ message: '打卡上班成功', data: record });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError' || error.original?.code === '23505') {
            return res.status(409).json({ error: '今天已完成上班打卡' });
        }
        console.error('上班打卡失敗:', error);
        res.status(500).json({ error: '上班打卡失敗，請稍後再試' });
    }
});

// 2. 下班打卡
router.post('/clockOUT', authenticateToken, checkRole(['employee', 'manager', 'admin']), async (req, res) => {
    try {
        const taipeiDateParts = new Intl.DateTimeFormat('en', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date());
        const taipeiDate = `${taipeiDateParts.find(part => part.type === 'year').value}-${taipeiDateParts.find(part => part.type === 'month').value}-${taipeiDateParts.find(part => part.type === 'day').value}`;
        const record = await AttendanceRecord.findOne({
            where: { employeeId: req.user.id, status: 'IN', recordDate: taipeiDate },
            order: [['clockInTime', 'DESC']]
        });
        if (!record) {
            return res.status(404).json({ error: '今天尚未完成上班打卡' });
        }
        record.clockOutTime = new Date();
        record.status = 'OUT';
        await record.save();
        res.status(200).json({ message: '打卡下班成功', data: record });
    } catch (error) {
        console.error('下班打卡失敗:', error);
        res.status(500).json({ error: '下班打卡失敗，請稍後再試' });
    }
});

// 3. 申請請假
router.post('/askForLeave', authenticateToken, checkRole(['employee', 'manager', 'admin']), async (req, res) => {
    const { employeeId, type, startTime, endTime, reason, managerId } = req.body;
    try {
        const request = await Request.create({
            employeeId,
            requestType: type || 'leave',
            leaveType: type,
            startTime,
            endTime,
            reason,
            managerId,
            status: 'Pending'
        });
        res.status(201).json({ message: '請假申請已提交，已通知經理', data: request });
    } catch (error) {
        res.status(500).json({ error: '申請失敗: ' + error.message });
    }
});

// 申請加班
router.post('/askForWorkOvertime', authenticateToken, checkRole(['employee', 'manager', 'admin']), async (req, res) => {
    const { employeeId, type, startTime, endTime, reason, managerId } = req.body;
    try {
        const request = await Request.create({
            employeeId,
            requestType: type || 'overtime',
            startTime,
            endTime,
            reason,
            managerId,
            status: 'Pending'
        });
        res.status(201).json({ message: '加班申請已提交，已通知經理', data: request });
    } catch (error) {
        res.status(500).json({ error: '申請失敗: ' + error.message });
    }
});

// 4. 取得待審核列表 (經理視角)
router.get('/LeaveReviewList', authenticateToken, checkRole(['manager', 'admin']), async (req, res) => {
    const { managerId } = req.query;
    try {
        const list = await Request.findAll({ 
            where: { managerId, status: 'Pending' },
            include: ['employee']
        });
        res.status(200).json({ data: list }); 
    } catch (error) {
        res.status(500).json({ error: '無法取得列表: ' + error.message });
    }
});

// 5. 審核請假
router.post('/LeaveReview', authenticateToken, checkRole(['manager', 'admin']), async (req, res) => {
    const { requestId, status, reviewComment } = req.body;
    try {
        const request = await Request.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ error: '申請不存在' });
        }
        request.status = status;
        request.reviewComment = reviewComment;
        await request.save();
        res.status(200).json({ message: `審核完成：${status}`, data: request });
    } catch (error) {
        res.status(500).json({ error: '審核程序出錯: ' + error.message });
    }
});

// 6. 查詢出缺勤紀錄
router.get('/attendanceRecord', authenticateToken, checkRole(['employee', 'manager', 'admin']), async (req, res) => {
    const { employeeId, startDate, endDate } = req.query;
    try {
        const records = await AttendanceRecord.findAll({
            where: { 
                employeeId,
                clockInTime: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        });
        res.status(200).json({ employeeId, records });
    } catch (error) {
        res.status(500).json({ error: '查詢失敗: ' + error.message });
    }
});

// 7. 取得員工總請假時數與加班時數
router.get('/employeeHours', authenticateToken, checkRole(['employee', 'manager', 'admin']), async (req, res) => {
    try {
        let { employeeId, startDate, endDate } = req.query;
        if (!employeeId) employeeId = req.user.id;

        // 員工只能查自己的資料
        if (req.user.role === 'employee' && Number(employeeId) !== Number(req.user.id)) {
            return res.status(403).json({ error: '權限不足，無法查詢其他員工資料' });
        }

        const where = { employeeId, status: 'Approved' };
        if (startDate && endDate) {
            where[Op.or] = [
                { startTime: { [Op.between]: [new Date(startDate), new Date(endDate)] } },
                { endTime: { [Op.between]: [new Date(startDate), new Date(endDate)] } }
            ];
        }

        const requests = await Request.findAll({ where });

        let totalLeaveHours = 0;
        let totalOvertimeHours = 0;

        requests.forEach(r => {
            const start = new Date(r.startTime);
            const end = new Date(r.endTime);
            const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
            if (r.requestType === 'leave') totalLeaveHours += hours;
            if (r.requestType === 'overtime') totalOvertimeHours += hours;
        });

        // 四捨五入到小數點兩位
        totalLeaveHours = Math.round(totalLeaveHours * 100) / 100;
        totalOvertimeHours = Math.round(totalOvertimeHours * 100) / 100;

        res.status(200).json({ employeeId, totalLeaveHours, totalOvertimeHours });
    } catch (error) {
        res.status(500).json({ error: '計算失敗: ' + error.message });
    }
});

module.exports = router;