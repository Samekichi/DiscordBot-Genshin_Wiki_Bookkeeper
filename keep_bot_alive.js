var http = require("http");

function startServer() {
    try {
        http
            .createServer(function(req, res) {
                res.write("Bot server up!");
                res.end();
            })
            .listen(8080);
        console.log("Server started on port 8080");
    } catch (error) {
        console.error("Error occurred:", error);
        console.log("Restarting server...");
        startServer();
    }
}

startServer();