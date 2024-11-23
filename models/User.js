module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("users", {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        commandCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    });
    return User;
};