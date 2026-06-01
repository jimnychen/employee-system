const sequelize = require('../config/database');
const UserModel = require('./User');
const AttendanceRecordModel = require('./AttendanceRecord');
const RequestModel = require('./Request');

// 初始化模型
const User = UserModel(sequelize);
const AttendanceRecord = AttendanceRecordModel(sequelize);
const Request = RequestModel(sequelize);

// 定義關聯
User.hasMany(AttendanceRecord, { foreignKey: 'employeeId', as: 'attendanceRecords' });
AttendanceRecord.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

User.hasMany(Request, { foreignKey: 'employeeId', as: 'requests' });
Request.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });

User.hasMany(Request, { foreignKey: 'managerId', as: 'managedRequests' });
Request.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

module.exports = {
    sequelize,
    User,
    AttendanceRecord,
    Request
};
