var http = require("http");

http
    .createServer(function(req, res) {
        res.write("Bot server up!");
        res.end();
    })
    .listen(8080);