const { sequelize, users } = require("../models");

try {
    // C
    const testUser = await users.upsert({
        userId: "testing_dev_env_and_DB_migrations",
        commandCount: 233,
    })
    console.log("Test user created: ", testUser.toJSON());
    // R
    const foundTestUser = await users.findByPk("testing_dev_env_and_DB_migrations");
    if (foundTestUser) {
        console.log("Test user found: ", foundTestUser.toJSON());
    } else {
        console.log(`Test user "testing_dev_env_and_DB_migrations" not found.`);
    }
    // U
    if (foundTestUser) {
        await foundTestUser.increment("commandCount", { by: 1 });
        await foundTestUser.save();
        console.log("Test user updated: ", foundTestUser.toJSON());
    }
    // D
    if (foundTestUser) {
        await foundTestUser.destroy();
        console.log("Test user deleted.");
    }
} catch (error) {
    console.error("DB test failed:", error);
} finally {
    await sequelize.close();
}