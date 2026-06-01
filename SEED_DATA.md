# 載入測試資料

本專案提供兩種方式載入測試資料：

## 方式 1：使用 SQL Seed 檔案（推薦用於 PostgreSQL 直連）

```bash
# 連接到 PostgreSQL 並執行 seed.sql
psql -U employee_system -d employee_system -f seed.sql
```

## 方式 2：使用 Node.js Seed 腳本（推薦用於 Sequelize ORM）

```bash
# 確保資料庫表已建立，然後執行：
node seed-data.js
```

此方式會自動：
- 建立 6 個測試使用者（1 個 admin、2 個 manager、3 個 employee）
- 建立 9 筆打卡紀錄
- 建立 7 筆請假/加班申請

## 測試帳號

| 帳號 | 密碼 | 角色 |
|------|------|------|
| admin | admin123 | admin |
| manager1 | password123 | manager |
| manager2 | password123 | manager |
| employee1 | password123 | employee |
| employee2 | password123 | employee |
| employee3 | password123 | employee |

## 測試資料內容

### 使用者資料
- **Admin**: 系統管理員
- **Manager**: 部門經理 × 2
- **Employee**: 普通員工 × 3

### 打卡紀錄
- **日期**: 2024-06-01 至 2024-06-03
- **員工**: 員工甲、乙、丙
- **上班時間**: 08:45 - 09:30
- **下班時間**: 17:45 - 18:30
- **狀態**: 大部分已下班（OUT），1 筆仍在上班（IN）

### 請假/加班申請
- **待審核**: 2 筆（請假）
- **已核准**: 3 筆（請假 2 筆、加班 1 筆）
- **已拒絕**: 1 筆（請假）
- **待審核**: 1 筆（加班）

## 清空資料

若要重新載入測試資料，先清空現有資料：

```bash
# 使用 psql 清空表
psql -U employee_system -d employee_system

-- 在 psql 中執行：
TRUNCATE TABLE requests CASCADE;
TRUNCATE TABLE attendance_records CASCADE;
TRUNCATE TABLE users CASCADE;
```

然後重新執行 seed 指令。

## 驗證資料

### 使用 psql 查詢

```sql
-- 查看所有使用者
SELECT * FROM users;

-- 查看打卡紀錄
SELECT * FROM attendance_records;

-- 查看請假申請
SELECT * FROM requests;
```

### 使用 API 測試

1. 登入取得 Token：
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"employee1","password":"password123"}'
```

2. 使用 Token 查詢打卡紀錄：
```bash
curl -X GET "http://localhost:3000/api/attendanceRecord?employeeId=4&startDate=2024-06-01&endDate=2024-06-30" \
  -H "Authorization: Bearer {token}"
```

3. 查看待審核列表（需要 manager 權限）：
```bash
curl -X GET "http://localhost:3000/api/LeaveReviewList?managerId=2" \
  -H "Authorization: Bearer {manager_token}"
```
