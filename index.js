const express = require('express');
const app = express();
const api = require('./api.js');
const { sequelize } = require('./models');
const port = 3000;

// 中間件
app.use(express.json());

// 初始化資料庫連線
sequelize.authenticate()
    .then(() => console.log('資料庫連線成功'))
    .catch(err => console.error('資料庫連線失敗:', err));

// 測試路由
app.get('/', (req, res) => {
    // 打卡頁面
    res.send('Hello, this is the attendance management system API!');   
})
app.get('/askForLeave', (req, res) => {
    // 申請請假頁面
    res.send('Hello, this is the attendance management system API!');   
})
app.get('/LeaveReviewList', (req, res) => {
    // 申請請假頁面
    res.send('Hello, this is the attendance management system API!');   
})
app.get('/attendanceRecord', (req, res) => {
    // 申請請假頁面
    res.send('Hello, this is the attendance management system API!');   
})
app.use('/api', api);
app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})