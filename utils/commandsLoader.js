const fs = require("fs");
const path = require("path");

function loadCommandsRecursive(dir) {
    const commands = [];
    // Read all entries in the directory
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Read from sub-directory
            commands.push(...loadCommandsRecursive(fullPath));
        } else if (entry.isFile() && entry.name.endsWith(".js")) {
            // Read command
            const command = require(fullPath);
            commands.push({ command, fullPath });
        }
    }
    return commands;
}

module.exports = { loadCommandsRecursive };