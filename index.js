const express = require('express');
const path = require('path');
const app = express();
const api = require('./api.js');
const { sequelize } = require('./models');
const port = 3000;

// 中間件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages')));

// 初始化資料庫連線
sequelize.authenticate()
    .then(() => console.log('資料庫連線成功'))
    .catch(err => console.error('資料庫連線失敗:', err));

// 測試路由
app.get('/', (req, res) => {
    // 打卡頁面
    res.sendFile(path.join(__dirname, 'pages', 'home.html'));
});
app.get('/askForLeave', (req, res) => {
    // 申請請假頁面
    res.sendFile(path.join(__dirname, 'pages', 'leave.html'));
});
app.get('/LeaveReviewList', (req, res) => {
    // 申請請假頁面
    res.sendFile(path.join(__dirname, 'pages', 'leave-review.html'));
});
app.get('/attendanceRecord', (req, res) => {
    // 申請請假頁面
    res.sendFile(path.join(__dirname, 'pages', 'attendance-record.html'));
});
app.use('/api', api);
app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})