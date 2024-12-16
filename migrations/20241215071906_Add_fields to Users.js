const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * addColumn(isBot) => "users"
 * addColumn(avatar) => "users"
 * addColumn(discriminator) => "users"
 * addColumn(username) => "users"
 *
 */

const info = {
  revision: 4,
  name: "Add fields to Users",
  created: "2024-12-15T07:19:06.417Z",
  comment: "",
};

const migrationCommands = (transaction) => [
  {
    fn: "addColumn",
    params: [
      "users",
      "isBot",
      { type: Sequelize.BOOLEAN, field: "isBot", defaultValue: false },
      { transaction },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "users",
      "avatar",
      { type: Sequelize.STRING, field: "avatar" },
      { transaction },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "users",
      "discriminator",
      { type: Sequelize.STRING, field: "discriminator" },
      { transaction },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "users",
      "username",
      { type: Sequelize.STRING, field: "username" },
      { transaction },
    ],
  },
];

const rollbackCommands = (transaction) => [
  {
    fn: "removeColumn",
    params: ["users", "isBot", { transaction }],
  },
  {
    fn: "removeColumn",
    params: ["users", "avatar", { transaction }],
  },
  {
    fn: "removeColumn",
    params: ["users", "discriminator", { transaction }],
  },
  {
    fn: "removeColumn",
    params: ["users", "username", { transaction }],
  },
];

const pos = 0;
const useTransaction = true;

const execute = (queryInterface, sequelize, _commands) => {
  let index = pos;
  const run = (transaction) => {
    const commands = _commands(transaction);
    return new Promise((resolve, reject) => {
      const next = () => {
        if (index < commands.length) {
          const command = commands[index];
          console.log(`[#${index}] execute: ${command.fn}`);
          index++;
          queryInterface[command.fn](...command.params).then(next, reject);
        } else resolve();
      };
      next();
    });
  };
  if (useTransaction) return queryInterface.sequelize.transaction(run);
  return run(null);
};

module.exports = {
  pos,
  useTransaction,
  up: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, migrationCommands),
  down: (queryInterface, sequelize) =>
    execute(queryInterface, sequelize, rollbackCommands),
  info,
};
