# Attendance Management API

這是一個使用 Node.js、Express 和 Sequelize 連接 PostgreSQL 的員工出勤管理系統 API。功能包括：

- 使用者登入與註冊
- 上班打卡 / 下班打卡
- 請假申請
- 加班申請
- 經理待審核請假/加班列表
- 查詢出缺勤紀錄

---

## 專案結構

```
project/
├── api.js                   # API 路由定義
├── checkRole.js             # 角色檢查中間件
├── checkToken.js            # JWT Token 驗證中間件
├── index.js                 # 應用程式入口
├── package.json             # 專案依賴
├── schema.sql               # PostgreSQL 資料表定義
├── seed.sql                 # SQL 測試資料
├── seed-data.js             # Sequelize 測試資料腳本
├── .env.example             # 環境變數範本
├── SEED_DATA.md             # 測試資料說明
├── SEQUELIZE_SETUP.md       # Sequelize/PostgreSQL 設定說明
└── models/
    ├── AttendanceRecord.js  # 打卡紀錄模型
    ├── Request.js           # 請假/加班申請模型
    ├── User.js              # 使用者模型
    └── index.js             # 模型初始化與關聯
```

---

## 環境需求

- Node.js 18+ / 20+
- PostgreSQL

---

## 安裝步驟

1. 下載專案後進到專案資料夾：

```bash
cd project
```

2. 安裝相依套件：

```bash
npm install
```

3. 複製 `.env.example` 為 `.env`：

```bash
cp .env.example .env
```

4. 編輯 `.env`，填入 PostgreSQL 連線資訊與 JWT 密鑰：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

5. 建立資料庫與資料表：

```bash
createdb employee_system
psql -U postgres -d employee_system -f schema.sql
```

6. 啟動伺服器：

```bash
node index.js
```

預設會在 `http://localhost:3000` 啟動。

---

## 測試資料載入

可選擇使用 SQL 或 Node.js 腳本載入測試資料。

### 方式 1：使用 SQL Seed 檔案

```bash
psql -U employee_system -d employee_system -f seed.sql
```

### 方式 2：使用 Node.js Seed 腳本

```bash
node seed-data.js
```

---

## 主要 API

所有 API 路徑均掛載在 `/api` 下。

### 1. 登入

`POST /api/login`

Body:

```json
{
  "username": "employee1",
  "password": "password123"
}
```

回傳 `token`，後續需放在 `Authorization: Bearer {token}`。

### 2. 註冊使用者

`POST /api/register`

需要 `admin` 權限。

Body:

```json
{
  "username": "new_user",
  "password": "password123",
  "name": "New User",
  "role": "employee"
}
```

### 3. 上班打卡

`POST /api/clockIN`

Body:

```json
{
  "employeeId": 4,
  "clockInTime": "2024-06-01T09:00:00Z"
}
```

### 4. 下班打卡

`POST /api/clockOUT`

Body:

```json
{
  "employeeId": 4,
  "clockOutTime": "2024-06-01T18:00:00Z"
}
```

### 5. 申請請假

`POST /api/askForLeave`

Body:

```json
{
  "employeeId": 4,
  "type": "sick",
  "startTime": "2024-06-02T00:00:00Z",
  "endTime": "2024-06-02T23:59:59Z",
  "reason": "身體不適",
  "managerId": 2
}
```

### 6. 申請加班

`POST /api/askForWorkOvertime`

Body:

```json
{
  "employeeId": 4,
  "startTime": "2024-06-01T18:00:00Z",
  "endTime": "2024-06-01T20:00:00Z",
  "reason": "專案加班",
  "managerId": 2
}
```

### 7. 查詢假別餘額

`GET /api/leaveBalances?employeeId=4`

說明：
- `employeeId` 可選，員工身份只能查自己的餘額。
- 回傳 `leaveType`、`label`、`totalDays`、`usedDays`、`remainingDays`。

如果要初始化假別餘額，可在資料庫建立 `leave_balances` 資料。

### 8. 取得待審核列表

`GET /api/LeaveReviewList?managerId=2`

只包含 `Pending` 狀態的請假/加班申請。

### 8. 審核請假/加班

`POST /api/LeaveReview`

Body:

```json
{
  "requestId": 1,
  "status": "Approved",
  "reviewComment": "核准"
}
```

### 9. 查詢出缺勤紀錄

`GET /api/attendanceRecord?employeeId=4&startDate=2024-06-01&endDate=2024-06-30`

---

### 10. 員工總請假時數與加班時數

`GET /api/employeeHours`

說明：回傳指定員工在（選擇性）日期範圍內已核准的請假總時數與加班總時數。

Query 參數：
- `employeeId`（選填）：欲查詢的員工 ID；未提供時會使用 token 中的 `id`。
- `startDate`、`endDate`（選填）：若提供，會以此日期範圍過濾（ISO 8601 或可被 `new Date()` 解析的字串）。

權限：
- `employee`：只能查詢自己的資料。
- `manager` / `admin`：可查詢任意員工的資料。

回傳範例：

```json
{
  "employeeId": 4,
  "totalLeaveHours": 16.5,
  "totalOvertimeHours": 8
}
```

備註：此 API 只計算 `Request` 中 `status = 'Approved'` 的紀錄，並以 `endTime - startTime` 換算小時數（結果四捨五入至小數點兩位）。

## 假別剩餘時間

目前系統主要記錄請假申請紀錄，但如果要顯示畫面上類似「特休剩餘 7 天」的資料，需要新增假別額度資料。

建議結構：

- `leave_balances` 資料表，用來儲存每位員工每種假別的總額度與已用天數。
- 當請假申請 `Approved` 後，扣除對應假別的已用值。
- 前端可從後端撈取每種假別的 `remainingDays`，再顯示在介面上。

### 建議 API

`GET /api/leaveBalances?employeeId=4`

回傳範例：

```json
{
  "employeeId": 4,
  "balances": [
    { "leaveType": "annual", "label": "特休", "remainingDays": 7 },
    { "leaveType": "personal", "label": "事假", "remainingDays": 14 },
    { "leaveType": "sick", "label": "普通傷病假", "remainingDays": 29 }
  ]
}
```

這樣前端就能直接呈現：

- 假別名稱
- 剩餘天數
- 加號或申請按鈕

---

## 測試帳號

以下為專案測試資料說明檔中預設帳號：

- `admin / admin123` (admin)
- `manager1 / password123` (manager)
- `manager2 / password123` (manager)
- `employee1 / password123` (employee)
- `employee2 / password123` (employee)
- `employee3 / password123` (employee)

---

## 注意事項

- 請確保 `.env` 中的 PostgreSQL 連線設定正確。
- `JWT_SECRET` 請務必設為安全字串。
- 如果欲重新載入測試資料，請先清空 `users`、`attendance_records`、`requests` 表。

---

## 其他

- `checkRole.js`：負責角色授權檢查。
- `checkToken.js`：負責 JWT 驗證。
- `models/`：定義 Sequelize ORM 模型與關聯。
- `schema.sql`：用於建立 PostgreSQL 資料表架構。
- `seed-data.js`：建立測試資料。
