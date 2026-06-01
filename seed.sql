-- 測試資料 Seed
-- 注意：密碼為 bcryptjs 加密的雜湊值
-- password: "password123" -> $2a$10$28cE9y1.ByILvXIG14jvz.UI.SShwOC.Zv5IwAPa5bUWtfDf/aXju

-- 插入使用者資料
DROP TABLE IF EXISTS requests ;
DROP TABLE IF EXISTS attendance_records ;
DROP TABLE IF EXISTS users ;
INSERT INTO users (username, password, name, role) VALUES
    ('admin', '$2a$10$28cE9y1.ByILvXIG14jvz.UI.SShwOC.Zv5IwAPa5bUWtfDf/aXju', '系統管理員', 'admin'),
    ('manager1', '$2a$10$28cE9y1.ByILvXIG14jvz.UI.SShwOC.Zv5IwAPa5bUWtfDf/aXju', '部門經理', 'manager'),
    ('manager2', '$2a$10$28cE9y1.ByILvXIG14jvz.UI.SShwOC.Zv5IwAPa5bUWtfDf/aXju', '行政經理', 'manager'),
    ('employee1', '$2a$10$28cE9y1.ByILvXIG14jvz.UI.SShwOC.Zv5IwAPa5bUWtfDf/aXju', '員工甲', 'employee'),
    ('employee2', '$2a$10$28cE9y1.ByILvXIG14jvz.UI.SShwOC.Zv5IwAPa5bUWtfDf/aXju', '員工乙', 'employee'),
    ('employee3', '$2a$10$28cE9y1.ByILvXIG14jvz.UI.SShwOC.Zv5IwAPa5bUWtfDf/aXju', '員工丙', 'employee');

-- 插入打卡紀錄
INSERT INTO attendance_records (employee_id, clock_in_time, clock_out_time, status) VALUES
    -- 2024-06-01 的打卡紀錄
    (4, '2024-06-01 09:00:00+08:00', '2024-06-01 18:00:00+08:00', 'OUT'),
    (5, '2024-06-01 09:15:00+08:00', '2024-06-01 18:30:00+08:00', 'OUT'),
    (6, '2024-06-01 08:45:00+08:00', '2024-06-01 17:45:00+08:00', 'OUT'),
    -- 2024-06-02 的打卡紀錄
    (4, '2024-06-02 09:05:00+08:00', '2024-06-02 18:10:00+08:00', 'OUT'),
    (5, '2024-06-02 09:20:00+08:00', NULL, 'IN'),
    (6, '2024-06-02 09:00:00+08:00', '2024-06-02 17:50:00+08:00', 'OUT'),
     -- 2024-06-03 的打卡紀錄
    (4, '2024-06-03 09:10:00+08:00', '2024-06-03 18:05:00+08:00', 'OUT'),
    (5, '2024-06-03 09:00:00+08:00', '2024-06-03 18:00:00+08:00', 'OUT'),
    (6, '2024-06-03 09:30:00+08:00', '2024-06-03 18:20:00+08:00', 'OUT');

-- 插入請假申請
INSERT INTO requests (employee_id, request_type, leave_type, start_time, end_time, reason, manager_id, status, review_comment) VALUES
    -- 待審核的請假申請
    (4, 'leave', 'sick', '2024-06-04 00:00:00+08:00', '2024-06-04 23:59:59+08:00', '感冒', 2, 'Pending', NULL),
    (5, 'leave', 'personal', '2024-06-05 00:00:00+08:00', '2024-06-06 23:59:59+08:00', '個人事務', 2, 'Pending', NULL),
    -- 已核准的請假申請
    (6, 'leave', 'annual', '2024-05-20 00:00:00+08:00', '2024-05-24 23:59:59+08:00', '年假', 2, 'Approved', '核准'),
    (4, 'leave', 'sick', '2024-05-10 00:00:00+08:00', '2024-05-10 23:59:59+08:00', '身體不適', 2, 'Approved', '核准'),
    -- 已拒絕的請假申請
    (5, 'leave', 'personal', '2024-05-15 00:00:00+08:00', '2024-05-15 23:59:59+08:00', '私人行程', 2, 'Rejected', '該日期已有重要會議'),
    -- 加班申請
    (4, 'overtime', NULL, '2024-06-01 18:00:00+08:00', '2024-06-01 20:00:00+08:00', '專案趕工', 2, 'Approved', '核准加班'),
    (5, 'overtime', NULL, '2024-06-02 18:00:00+08:00', '2024-06-02 19:00:00+08:00', '系統維護', 2, 'Pending', NULL);
