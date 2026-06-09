const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const LeaveBalance = sequelize.define('LeaveBalance', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        annualLeave: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0
        },
        sickLeave: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0
        },
        personalLeave: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0
        },
        otherLeave: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0
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
        tableName: 'leave_balances',
        timestamps: true,
        underscored: true
    });

    return LeaveBalance;
};
