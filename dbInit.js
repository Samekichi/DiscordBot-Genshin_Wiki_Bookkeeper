const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
require('dotenv-safe').config({
    path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || "dev"}`),
    example: path.resolve(__dirname, `.env.example`),
});

// load DB config
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
    console.error("Missing required DB config values in .env file!");
    process.exit(1);
}

// init Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
});

// load all models
const models = {};
const modelsPath = path.resolve(__dirname, "models")
fs.readdirSync(modelsPath)
    .filter(file => file !== "index.js" && file.endsWith(".js"))
    .forEach(file => {
        const model = require(path.join(modelsPath, file))(sequelize, Sequelize.DataTypes);
        models[model.name] = model;
    })

// sync DB
const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize.sync({force: force, alter: true}).then(async () => {
    /* upsert initial data if needed */
	console.log('Database synced');
	sequelize.close();
}).catch(console.error);

