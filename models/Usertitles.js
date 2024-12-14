"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class UserTitles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            UserTitles.belongsTo(models.Users, {
                foreignKey: "userId",
            })

            UserTitles.belongsTo(models.Titles, {
                foreignKey: "titleId",
            })

            UserTitles.belongsTo(models.Users, {
                foreignKey: "grantedBy",
                as: "grantor",
            })
        }
    }

    UserTitles.init(
        {
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
            titleId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "titles",
                    key: "titleId",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            grantedBy: {
                type: DataTypes.STRING,
                allowNull: true,  // null if system grant
                defaultValue: null,
                references: {
                    model: "users",
                    key: "userId",
                },
                onUpdate: "CASCADE",
                onDelete: "NO ACTION",
            },
            isCustom: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            isSystemGrant: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            }
        },
        {
            sequelize,
            modelName: "UserTitles",
            tableName: "user_titles",
            timestamps: true,
        }
    );

    return UserTitles;
};
