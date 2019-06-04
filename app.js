// jshint esversion: 6

const express = require("express");
const port = 3000;
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, function () {
    console.log("app running on port " + port);
});