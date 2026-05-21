const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10
router.get('/', (req, res) => {
    res.send('Hello, this is system API!');   
});
// 角色檢查
const checkRole = require('./checkRole.js').checkRole;
//token 驗證
const authenticateToken = require('./checkToken.js').authenticateToken;
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // 1. 從資料庫尋找使用者
        // const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: '帳號不存在' });
        }
        // 2. 驗證密碼是否正確
        // const isMatch = await bcrypt.compare(password, user.password);
        const isMatch = true; // 測試條件為True
        if (!isMatch) {
            return res.status(401).json({ error: '密碼錯誤' });
        }

        // 3. 簽發 Token
        // Payload 建議只放非敏感資訊，如 ID, 角色, 姓名
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '24h' } // 設定 24 小時後過期
        );

        res.status(200).json({
            message: '登入成功',
            token: token,
            user: { id: user._id, name: user.name, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ error: '伺服器錯誤' });
    }
});
// 1. 上班打卡
router.post('/clockIN', authenticateToken,checkRole(['employee', 'manager','admin']), async(req, res) => {
    const { employeeId, clockInTime } = req.body;
    
    try {
        // 實作邏輯：檢查今日是否已打卡，若無則存入資料庫
        // const record = await Attendance.create({ employeeId, clockInTime, status: 'IN' });
        res.status(201).json({ message: '打卡上班成功', data: employeeId });
    } catch (error) {
        res.status(500).json({ error: '系統錯誤' });
    }
});
router.post('/register',authenticateToken,checkRole(['admin']),async(req,res)=>{
    //TODO 串接資料庫
    const { username, password } = req.body;
   try{
        const hashedPassword = await bcrypt.hash(password, saltRounds);
   } catch (error) {
        res.status(500).json({ error: '系統錯誤' });
    }
})
// 2. 下班打卡
router.post('/clockOUT', authenticateToken,checkRole(['employee', 'manager','admin']), async(req, res) => {
    const { employeeId, clockOutTime } = req.body;
    try {
        // 實作邏輯：尋找今日的打卡紀錄並更新下班時間
        res.status(200).json({ message: '打卡下班成功' });
    } catch (error) {
        res.status(500).json({ error: '系統錯誤' });
    }
});

// 3. 申請請假
router.post('/askForLeave', authenticateToken,checkRole(['employee', 'manager','admin']),    async(req, res) => {
    const { employeeId,type,startTime, endTime, reason, managerId } = req.body;
    try {
        // 1. 存入資料庫，狀態設為 'Pending'
        // 2. 觸發提醒通知給經理 (例如透過 Socket.io 或 Email)
        res.status(201).json({ message: '請假申請已提交，已通知經理' });
    } catch (error) {
        res.status(500).json({ error: '申請失敗' });
    }
});
router.post('/askForWorkOvertime', authenticateToken,checkRole(['employee', 'manager','admin']),    async(req, res) => {
    const { employeeId,type,startTime, endTime, reason, managerId } = req.body;
    try {
        // 1. 存入資料庫，狀態設為 'Pending'
        // 2. 觸發提醒通知給經理 (例如透過 Socket.io 或 Email)
        res.status(201).json({ message: '請假申請已提交，已通知經理' });
    } catch (error) {
        res.status(500).json({ error: '申請失敗' });
    }
});
// 4. 取得待審核列表 (經理視角)
router.get('/LeaveReviewList', authenticateToken,checkRole(['manager','admin']), async(req, res) => {
    const { managerId } = req.query;
    try {
        // 查詢該經理所屬部門中，狀態為 'Pending' 的申請
        // const list = await LeaveRequest.find({ managerId, status: 'Pending' });
        res.status(200).json({ data: [] }); 
    } catch (error) {
        res.status(500).json({ error: '無法取得列表' });
    }
});

// 5. 審核請假
router.post('/LeaveReview', authenticateToken,checkRole(['manager','admin']), async(req, res) => {
    const { requestId, status } = req.body; // status: 'Approved' or 'Rejected'
    try {
        // 1. 更新紀錄狀態
        // 2. 通知員工審核結果
        res.status(200).json({ message: `審核完成：${status}` });
    } catch (error) {
        res.status(500).json({ error: '審核程序出錯' });
    }
});

// 6. 查詢出缺勤紀錄
router.get('/attendanceRecord', authenticateToken,checkRole(['employee', 'manager','admin']), async(req, res) => {
    const { employeeId, startDate, endDate } = req.query;
    try {
        // 根據時間跨度查詢資料庫
        res.status(200).json({ employeeId, records: [] });
    } catch (error) {
        res.status(500).json({ error: '查詢失敗' });
    }
});

module.exports = router;