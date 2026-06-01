const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Request = sequelize.define('Request', {
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
        requestType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                isIn: [['leave', 'overtime']]
            }
        },
        leaveType: {
            type: DataTypes.STRING(50)
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        reason: {
            type: DataTypes.TEXT
        },
        managerId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'Pending',
            validate: {
                isIn: [['Pending', 'Approved', 'Rejected']]
            }
        },
        reviewComment: {
            type: DataTypes.TEXT
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
        tableName: 'requests',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['manager_id', 'status']
            }
        ]
    });

    return Request;
};
