"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // 1. Users can create titles
            Users.hasMany(models.Titles, {
                foreignKey: "createdBy",
                as: "createdTitles",
            })
            
            // 2. Users can have many titles
            Users.belongsToMany(models.Titles, {
                through: "UserTitles",
                foreignKey: "userId",
                otherKey: "titleId",
                as: "titles",
            })

            // 3. Admins can grant titles to users
            Users.hasMany(models.UserTitles, {
                foreignKey: "grantedBy",
                as: "grantedTitles",
            })
        }

        static async increaseCommandCount(userId, amount = 1) {
            const [[affectedInstances, instanceCount]] = await this.increment(
                "commandCount",
                {
                    by: amount,
                    where: { userId: userId },
                }
            ); // result is [the updated `user`, affected count] in PostgreSQL, `undefined` o.w.

            if (instanceCount == 0) {
                console.log("Creating new user (increaseCommandCount)");
                await this.create({ userId: userId, commandCount: amount });
            }
        }

        static async getCommandCount(userId) {
            var user = await this.findOne({
                where: { userId: userId },
                attributes: ["commandCount"],
            });

            if (user == null) {
                console.log("Creating new user (getCommandCount)");
                user = await this.create({ userId: userId, commandCount: 0 });
            }

            return user.commandCount;
        }
    }

    Users.prototype.incrementCommandCount = async function () {
        this.commandCount += 1;
        await this.save();
    };

    Users.init(
        {
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            commandCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            modelName: "Users",
            tableName: "users",
            timestamps: true,
        }
    );

    return Users;
};