"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Titles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // 1. Titles are created by users
            Titles.belongsTo(models.Users, {
                foreignKey: "createdBy",
                as: "creator",
            })

            // 2. Titles can be owned by many users
            Titles.belongsToMany(models.Users, {
                through: "UserTitles",
                foreignKey: "titleId",
                otherKey: "userId",
                as: "users",
            })

            // 3. A title belongs to a guild
            Titles.belongsTo(models.Guilds, {
                foreignKey: "guildId",
                as: "guild",
            })

        }

        static async createTitle(name, description, category="BASIC", createdBy, guildId) {
            if (name == null || createdBy == null) {
                throw new Error("name and createdBy must be specified.");
            }
            return await this.create({
                name: name,
                description: description,
                category: category,
                createdBy: createdBy,
                guildId: guildId,
            })
        }
    }

    Titles.init(
        {
            titleId: { 
                type:DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "guilds",
                    key: "guildId",
                }
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: DataTypes.STRING,
            category: DataTypes.STRING,
            isCustom: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultvalue: false,
            },
            createdBy: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "userId",
                },
                onUpdate: "CASCADE",
                onDelete: "NO ACTION",
            },
        },
        {
            sequelize,
            modelName: "Titles",
            tableName: "titles",
            timestamps: true,
            constraints: [
                {
                    fields: ["guildId", "name"],
                    type: "unique",
                    name: "unique_title_name_per_guild"
                }
            ]
        }
    );

    return Titles;
};
