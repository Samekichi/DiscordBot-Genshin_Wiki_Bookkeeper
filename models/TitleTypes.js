"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class TitleTypes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // 1. TitleTypes belongs to a guild
            TitleTypes.belongsTo(models.Guilds, {
                foreignKey: "guildId",
                as: "guild",
            })
            // 2. TitleTypes apply to many titles
            TitleTypes.hasMany(models.Titles, {
                foreignKey: "titleId",
                as: "titles",
            })
        }

        // TODO:
        static async createTitleType(name, description, titleType="BASIC", createdBy, guildId) {
            // if (name == null || createdBy == null) {
            //     throw new Error("name and createdBy must be specified.");
            // }
            // return await this.create({
            //     name: name,
            //     description: description,
            //     category: category,
            //     createdBy: createdBy,
            //     guildId: guildId,
            // })
        }
    }

    TitleTypes.init(
        {
            titleTypeId: { 
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
            modelName: "TitleTypes",
            tableName: "titletypes",
            timestamps: true,
            constraints: [
                {
                    fields: ["guildId", "name"],
                    type: "unique",
                    name: "unique_titletype_name_per_guild"
                }
            ]
        }
    );

    return TitleTypes;
};
