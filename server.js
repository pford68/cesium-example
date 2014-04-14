
var express = require("express"),
    app = express(),
    port = 8090;

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + "/src/"));
    app.use(app.router);
});

app.listen(port);
console.log("Server listening on port " + port);