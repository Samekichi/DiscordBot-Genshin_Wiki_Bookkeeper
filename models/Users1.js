"use strict";
const { Model, Sequelize } = require("sequelize");

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

            // 4. A User can be a member of many guilds
            Users.belongsToMany(models.Guilds, {
                through: "GuildMembers",
                foreignKey: "userId",
                otherKey: "guildId",
                as: "guilds",
            })

            // 5. A User can own many guilds
            Users.hasMany(models.Guilds, {
                foreignKey: "ownerId",
                as: "ownedGuilds",
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
                user = await this.createUser(userId);
            }

            return user.commandCount;
        }

        // TODO: Clean up
        // static async createUser(userId, userInstance) {
        //     if (userId == null || userInstance == null) {
        //         throw new Error("userId and userInstance must be specified.");
        //     }
        //     return await this.create({
        //         userId: userId,
        //         username: userInstance.username,
        //         discriminator: userInstance.discriminator,
        //         avatar: userInstance.displayAvatarURL(),
        //         isBot: userInstance.bot,
        //         commandCount: 0,
        //     })
        // }

        // static async getOrCreateUser(userId, userInstance) {
        //     var user = await this.findByPk(userId);
        //     if (user == null) {
        //         console.log("Creating new user (getOrCreateUser)");
        //         user = await this.createUser(userId, userInstance);
        //     }
        //     return user;   
        // }
        static async getOrCreateUser(userId, userInstance) {
            const [user, isNewRecord] = await this.findOrCreate({
                where: { userId },
                defaults: {
                    username: userInstance.username,
                    discriminator: userInstance.discriminator,
                    avatar: userInstance.displayAvatarURL(),
                    isBot: userInstance.bot,
                    commandCount: 0,
                }
            });

            if (isNewRecord) {
                console.log(`Created new user "${user.username}" (getOrCreateUser)`);
            }

            return user;
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
            username: DataTypes.STRING,
            discriminator: DataTypes.STRING,
            avatar: DataTypes.STRING,
            isBot: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
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