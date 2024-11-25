'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }

        static async increaseCommandCount(userId, amount = 1) {
            const [rowsUpdated] = await this.increment("commandCount", {
                by: amount,
                where: { userId: userId },
            });

            if (rowsUpdated == null) {
                await this.create({ userId: userId, commandCount: amount });
            }
        }

        static async getCommandCount(userId) {
            var user = await this.findOne({
                where: { userId: userId}, 
                attributes: ['commandCount'] 
            });

            if (user == null) {
                user = await this.create({ userId: userId, commandCount: 0 });
            }

            return user.commandCount;
        }
    }

    Users.prototype.incrementCommandCount = async function () {
        this.commandCount += 1;
        await this.save();
    };

    Users.init({
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        commandCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        sequelize,
        modelName: 'Users',
        tableName: 'users',
    });

    return Users;
};