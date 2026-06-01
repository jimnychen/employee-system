# 使用 Sequelize 連接 PostgreSQL - 設定步驟

## 1. 環境設定
複製 `.env.example` 為 `.env`，並填入你的 PostgreSQL 連接資訊：
```bash
cp .env.example .env
```

編輯 `.env` 設定資料庫認證：
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

## 2. 建立資料庫
使用 psql 或其他工具連接 PostgreSQL，執行以下命令：
```bash
createdb employee_system
```

或在 PostgreSQL 中：
```sql
CREATE DATABASE employee_system;
```

## 3. 建立資料表
在 PostgreSQL 中執行 `schema.sql` 建立表結構：
```bash
psql -U postgres -d employee_system -f schema.sql
```

## 4. 啟動伺服器
```bash
node index.js
```

伺服器將在 http://localhost:3000 啟動，並自動連接資料庫。

## 5. 測試 API

### 註冊新使用者（需要 Admin 權限）
```bash
POST /api/register
Header: Authorization: Bearer {token}
Body: {
  "username": "john_doe",
  "password": "password123",
  "name": "John Doe",
  "role": "employee"
}
```

### 登入
```bash
POST /api/login
Body: {
  "username": "john_doe",
  "password": "password123"
}
```

### 上班打卡
```bash
POST /api/clockIN
Header: Authorization: Bearer {token}
Body: {
  "employeeId": 1,
  "clockInTime": "2024-06-01T09:00:00Z"
}
```

### 下班打卡
```bash
POST /api/clockOUT
Header: Authorization: Bearer {token}
Body: {
  "employeeId": 1,
  "clockOutTime": "2024-06-01T18:00:00Z"
}
```

### 申請請假
```bash
POST /api/askForLeave
Header: Authorization: Bearer {token}
Body: {
  "employeeId": 1,
  "type": "sick",
  "startTime": "2024-06-02T00:00:00Z",
  "endTime": "2024-06-02T23:59:59Z",
  "reason": "感冒",
  "managerId": 2
}
```

## 檔案結構
```
project/
├── config/
│   └── database.js          # Sequelize 資料庫配置
├── models/
│   ├── User.js              # 使用者模型
│   ├── AttendanceRecord.js  # 打卡紀錄模型
│   ├── Request.js           # 請假/加班申請模型
│   └── index.js             # 模型初始化和關聯
├── api.js                   # API 路由定義
├── checkRole.js             # 角色檢查中間件
├── checkToken.js            # Token 驗證中間件
├── index.js                 # 應用程式入口
├── schema.sql               # PostgreSQL 資料表定義
├── package.json             # 專案依賴
├── .env.example             # 環境變數範本
└── README.md                # 本說明文件
```

## 常見問題

### 1. 連接資料庫失敗
- 確認 PostgreSQL 服務已啟動
- 檢查 .env 中的連接設定是否正確
- 確認資料庫已建立

### 2. 錯誤 "relation does not exist"
- 執行 `schema.sql` 建立所有表

### 3. Sequelize 模型不同步
- 刪除資料庫重新建立，或使用 Sequelize migration 工具
