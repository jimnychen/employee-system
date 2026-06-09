const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, AttendanceRecord, Request } = require('./models');
const { Op } = require('sequelize');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const saltRounds = 10;

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

// 註冊使用者
router.post('/register', authenticateToken, checkRole(['admin']), async (req, res) => {
    const { username, password, name, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await User.create({
            username,
            password: hashedPassword,
            name,
            role: role || 'employee'
        });
        res.status(201).json({ 
            message: '使用者註冊成功', 
            data: { id: user.id, username: user.username } 
        });
    } catch (error) {
        res.status(500).json({ error: '系統錯誤: ' + error.message });
    }
});

// 1. 上班打卡
router.post('/clockIN', authenticateToken, checkRole(['employee', 'manager', 'admin']), async (req, res) => {
    const { employeeId, clockInTime } = req.body;
    try {
        const record = await AttendanceRecord.create({ 
            employeeId, 
            clockInTime: clockInTime || new Date(), 
            status: 'IN' 
        });
        res.status(201).json({ message: '打卡上班成功', data: record });
    } catch (error) {
        res.status(500).json({ error: '系統錯誤: ' + error.message });
    }
});

// 2. 下班打卡
router.post('/clockOUT', authenticateToken, checkRole(['employee', 'manager', 'admin']), async (req, res) => {
    const { employeeId, clockOutTime } = req.body;
    try {
        const record = await AttendanceRecord.findOne({
            where: { employeeId, status: 'IN' },
            order: [['clockInTime', 'DESC']]
        });
        if (!record) {
            return res.status(404).json({ error: '未找到上班紀錄' });
        }
        record.clockOutTime = clockOutTime || new Date();
        record.status = 'OUT';
        await record.save();
        res.status(200).json({ message: '打卡下班成功', data: record });
    } catch (error) {
        res.status(500).json({ error: '系統錯誤: ' + error.message });
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