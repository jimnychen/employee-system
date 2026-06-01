const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100)
        },
        role: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'employee',
            validate: {
                isIn: [['admin', 'manager', 'employee']]
            }
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
        tableName: 'users',
        timestamps: true,
        underscored: true
    });

    return User;
};
