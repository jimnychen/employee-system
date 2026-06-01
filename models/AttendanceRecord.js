const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AttendanceRecord = sequelize.define('AttendanceRecord', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        clockInTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        clockOutTime: {
            type: DataTypes.DATE
        },
        status: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'IN',
            validate: {
                isIn: [['IN', 'OUT', 'PENDING']]
            }
        },
        recordDate: {
            type: DataTypes.DATEONLY,
            // Generated column - no need to define it here; DB handles it
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'attendance_records',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['employee_id', 'record_date']
            }
        ]
    });

    return AttendanceRecord;
};
