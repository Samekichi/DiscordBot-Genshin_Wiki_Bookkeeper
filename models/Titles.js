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
            // 1. Titles are created by Users
            Titles.belongsTo(models.Users, {
                foreignKey: "createdBy",
                as: "creator",
            })

            // 2. Titles can be owned by many Users
            Titles.belongsToMany(models.Users, {
                through: "UserTitles",
                foreignKey: "titleId",
                otherKey: "userId",
                as: "users",
            })

            // 3. A Title belongs to a Guild
            Titles.belongsTo(models.Guilds, {
                foreignKey: "guildId",
                as: "guild",
            })

            // 4. A Title belongs to a TitleType
            Titles.belongsTo(models.TitleTypes, {
                foreignKey: "titleTypeId",
                as: "type",
            })

        }

        static async createTitle(name, description, titleTypeId=null, createdBy, guildId, options = {}) {
            if (!name || !createdBy || !guildId) {
                throw new Error("name, createdBy, and guildId must be specified to create a Title.");
            }
            return await this.create({
                name,
                description,
                titleTypeId,
                createdBy,
                guildId,
            }, options);
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
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: DataTypes.STRING,
            titleTypeId: {
                type: DataTypes.UUID,
                allowNull: true,  // null = default type
                references: {
                    model: "title_types",
                    key: "titleTypeId",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",  // change to default type
            },
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
