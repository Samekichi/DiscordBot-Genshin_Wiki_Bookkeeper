"use strict";
const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class GuildMembers extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            GuildMembers.belongsTo(models.Users, {
                foreignKey: "userId",
                as: "user",
            })

            GuildMembers.belongsTo(models.Guilds, {
                foreignKey: "guildId",
                as: "guild",
            })
        }
    }

    GuildMembers.init(
        {
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
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "userId",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            joinDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        },
        {
            sequelize,
            modelName: "GuildMembers",
            tableName: "guild_members",
            timestamps: true,
        }
    );

    return GuildMembers;
};
