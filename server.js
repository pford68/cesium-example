
var express = require("express"),
    app = express();

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use("/cesium-example", express.static(__dirname + "/src/"));
    app.use(app.router);
});

exports.start = function(port){
    app.listen(port);
    console.log("Server listening on port " + port);
}