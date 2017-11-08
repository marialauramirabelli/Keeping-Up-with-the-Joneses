var express = require("express");
var http = require("http");
var path = require("path");
var fs = require("fs");

var app = new express();
app.set("port", 994);

app.use(express.static(path.join(__dirname, "public_pf")));

http.createServer(app).listen(app.get("port"), function(){
  console.log("Server started on port", app.get("port"));
});
