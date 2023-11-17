'use strict'
const {
    Model,
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class User extends Model { }
    User.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(),
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
        timestamps: true
    })
    return User
}
