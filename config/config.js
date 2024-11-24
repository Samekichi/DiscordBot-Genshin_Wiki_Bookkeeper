const path = require("path");
require('dotenv-safe').config({
    path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || "dev"}`),
    example: path.resolve(__dirname, `../.env.example`),
});

module.exports = {
    dev: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "postgres"
    },
    prod: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "postgres"
    }
};
