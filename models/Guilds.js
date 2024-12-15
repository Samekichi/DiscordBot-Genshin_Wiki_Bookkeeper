"use strict";
const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Guilds extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // 1. A Guild has an owner
            Guilds.belongsTo(models.Users, {
                foreignKey: "ownerId",
                as: "owner",
            })
            
            // 2. A Guild has many user members
            Guilds.belongsToMany(models.Users, {
                through: "GuildMembers",
                foreignKey: "guildId",
                otherKey: "userId",
                as: "members",
            })

            // 3. A Guild can have many titles
            Guilds.hasMany(models.Titles, {
                foreignKey: "guildId",
                as: "titles",
            })
        }

        static async createUser(userId, userInstance) {
            if (userId == null || userInstance == null) {
                throw new Error("userId and userInstance must be specified.");
            }
            const createDate = new Date();
            return await this.create({
                userId: userId,
                username: userInstance.username,
                discriminator: userInstance.discriminator,
                avatar: userInstance.displayAvatarURL(),
                isBot: userInstance.bot,
                firstActive: createDate,
                // lastActive: createDate,
                commandCount: 0,
            })
        }

        static async getOrCreateUser(userId, userInstance) {
            var user = await this.findByPk(userId);
            if (user == null) {
                console.log("Creating new user (getOrCreateUser)");
                user = await this.createUser(userId, userInstance);
            }
            return user;   
        }
    }

    Guilds.init(
        {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            nameAcronym: DataTypes.STRING,
            description: DataTypes.STRING,
            icon: DataTypes.STRING,
            ownerId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "userId",
                },
            },
        },
        {
            sequelize,
            modelName: "Guilds",
            tableName: "guilds",
            timestamps: true,
        }
    );

    return Guilds;
};