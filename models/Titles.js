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
        }
    }

    Titles.init(
        {
            titleId: { 
                type:DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: DataTypes.STRING,
            category: DataTypes.STRING,
            createdBy: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "userId"
                },
                onUpdate: "CASCADE",
                onDelete: "NO ACTION",
            }
        },
        {
            sequelize,
            modelName: "Titles",
            tableName: "titles",
            timestamps: true,
        }
    );

    return Titles;
};
