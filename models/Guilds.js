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

            // 4. A Guild has at most 24 TitleTypes
            Guilds.hasMany(models.TitleTypes, {
                foreignKey: "titleTypeId",
                as: "titleTypes",
            })
        }
        
        static async getOrCreateGuild(guildId, guildInstance) {
            const [guild, isNewRecord] = await this.findOrCreate({
                where: { guildId },
                defaults: {
                    name: guildInstance.name,
                    nameAcronym: guildInstance.nameAcronym,
                    description: guildInstance.description,
                    icon: iconURL(),
                    ownerId: guildInstance.ownerId,
                }
            });

            if (isNewRecord) {
                console.log(`Created new guild "${guild.name}" (getOrCreateGuild)`);
            }

            return guild;
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
            maxTitleCountPerMember: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 3,
            }
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