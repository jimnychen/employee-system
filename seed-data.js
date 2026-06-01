/**
 * Sequelize Seed Script
 * 用法: node seed-data.js
 */

const bcrypt = require('bcryptjs');
const { sequelize, User, AttendanceRecord, Request } = require('./models');

const seedData = async () => {
    try {
        console.log('開始載入測試資料...');
        
        // 清空現有資料（可選）
        // await sequelize.truncate({ cascade: true, force: true });
        
        // 1. 建立使用者
        const users = await User.bulkCreate([
            {
                username: 'admin',
                password: await bcrypt.hash('admin123', 10),
                name: '系統管理員',
                role: 'admin'
            },
            {
                username: 'manager1',
                password: await bcrypt.hash('password123', 10),
                name: '部門經理',
                role: 'manager'
            },
            {
                username: 'manager2',
                password: await bcrypt.hash('password123', 10),
                name: '行政經理',
                role: 'manager'
            },
            {
                username: 'employee1',
                password: await bcrypt.hash('password123', 10),
                name: '員工甲',
                role: 'employee'
            },
            {
                username: 'employee2',
                password: await bcrypt.hash('password123', 10),
                name: '員工乙',
                role: 'employee'
            },
            {
                username: 'employee3',
                password: await bcrypt.hash('password123', 10),
                name: '員工丙',
                role: 'employee'
            }
        ], { ignoreDuplicates: true });
        
        console.log('✓ 已建立 6 個使用者');
        
        // 2. 建立打卡紀錄
        const today = new Date();
        const attendance = await AttendanceRecord.bulkCreate([
            // 2024-06-01 的打卡紀錄
            {
                employeeId: users[3].id,
                clockInTime: new Date('2024-06-01 09:00:00'),
                clockOutTime: new Date('2024-06-01 18:00:00'),
                status: 'OUT'
            },
            {
                employeeId: users[4].id,
                clockInTime: new Date('2024-06-01 09:15:00'),
                clockOutTime: new Date('2024-06-01 18:30:00'),
                status: 'OUT'
            },
            {
                employeeId: users[5].id,
                clockInTime: new Date('2024-06-01 08:45:00'),
                clockOutTime: new Date('2024-06-01 17:45:00'),
                status: 'OUT'
            },
            // 2024-06-02 的打卡紀錄
            {
                employeeId: users[3].id,
                clockInTime: new Date('2024-06-02 09:05:00'),
                clockOutTime: new Date('2024-06-02 18:10:00'),
                status: 'OUT'
            },
            {
                employeeId: users[4].id,
                clockInTime: new Date('2024-06-02 09:20:00'),
                clockOutTime: null,
                status: 'IN'
            },
            {
                employeeId: users[5].id,
                clockInTime: new Date('2024-06-02 09:00:00'),
                clockOutTime: new Date('2024-06-02 17:50:00'),
                status: 'OUT'
            },
            // 2024-06-03 的打卡紀錄
            {
                employeeId: users[3].id,
                clockInTime: new Date('2024-06-03 09:10:00'),
                clockOutTime: new Date('2024-06-03 18:05:00'),
                status: 'OUT'
            },
            {
                employeeId: users[4].id,
                clockInTime: new Date('2024-06-03 09:00:00'),
                clockOutTime: new Date('2024-06-03 18:00:00'),
                status: 'OUT'
            },
            {
                employeeId: users[5].id,
                clockInTime: new Date('2024-06-03 09:30:00'),
                clockOutTime: new Date('2024-06-03 18:20:00'),
                status: 'OUT'
            }
        ], { ignoreDuplicates: true });
        
        console.log('✓ 已建立 9 筆打卡紀錄');
        
        // 3. 建立請假/加班申請
        const requests = await Request.bulkCreate([
            // 待審核的請假申請
            {
                employeeId: users[3].id,
                requestType: 'leave',
                leaveType: 'sick',
                startTime: new Date('2024-06-04 00:00:00'),
                endTime: new Date('2024-06-04 23:59:59'),
                reason: '感冒',
                managerId: users[1].id,
                status: 'Pending'
            },
            {
                employeeId: users[4].id,
                requestType: 'leave',
                leaveType: 'personal',
                startTime: new Date('2024-06-05 00:00:00'),
                endTime: new Date('2024-06-06 23:59:59'),
                reason: '個人事務',
                managerId: users[1].id,
                status: 'Pending'
            },
            // 已核准的請假申請
            {
                employeeId: users[5].id,
                requestType: 'leave',
                leaveType: 'annual',
                startTime: new Date('2024-05-20 00:00:00'),
                endTime: new Date('2024-05-24 23:59:59'),
                reason: '年假',
                managerId: users[1].id,
                status: 'Approved',
                reviewComment: '核准'
            },
            {
                employeeId: users[3].id,
                requestType: 'leave',
                leaveType: 'sick',
                startTime: new Date('2024-05-10 00:00:00'),
                endTime: new Date('2024-05-10 23:59:59'),
                reason: '身體不適',
                managerId: users[1].id,
                status: 'Approved',
                reviewComment: '核准'
            },
            // 已拒絕的請假申請
            {
                employeeId: users[4].id,
                requestType: 'leave',
                leaveType: 'personal',
                startTime: new Date('2024-05-15 00:00:00'),
                endTime: new Date('2024-05-15 23:59:59'),
                reason: '私人行程',
                managerId: users[1].id,
                status: 'Rejected',
                reviewComment: '該日期已有重要會議'
            },
            // 加班申請
            {
                employeeId: users[3].id,
                requestType: 'overtime',
                startTime: new Date('2024-06-01 18:00:00'),
                endTime: new Date('2024-06-01 20:00:00'),
                reason: '專案趕工',
                managerId: users[1].id,
                status: 'Approved',
                reviewComment: '核准加班'
            },
            {
                employeeId: users[4].id,
                requestType: 'overtime',
                startTime: new Date('2024-06-02 18:00:00'),
                endTime: new Date('2024-06-02 19:00:00'),
                reason: '系統維護',
                managerId: users[1].id,
                status: 'Pending'
            }
        ], { ignoreDuplicates: true });
        
        console.log('✓ 已建立 7 筆請假/加班申請');
        console.log('\n✅ 測試資料載入完成！\n');
        console.log('測試帳號：');
        console.log('  Admin: admin / admin123');
        console.log('  Manager: manager1 / password123');
        console.log('  Employee: employee1 / password123');
        
    } catch (error) {
        console.error('❌ 載入測試資料失敗:', error.message);
    } finally {
        await sequelize.close();
    }
};

seedData();
