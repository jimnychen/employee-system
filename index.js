const express = require('express');
const app = express();
const api = require('./api.js');
const port = 3000;
// 假設已引入相應的資料庫 Model
// const { Attendance, LeaveRequest, Employee } = require('./models');
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