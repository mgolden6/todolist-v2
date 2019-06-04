// jshint esversion: 6

const express = require("express");
const port = 3000;
const app = express();

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {

    let today = new Date();
    let options = {
        weekday: "long",
        month: "long",
        day: "numeric"
    };

    let weekday = today.toLocaleDateString("en-US", options);
    res.render("list", {
        kindOfDay: weekday
    });
});

app.listen(port, function () {
    console.log("app running on port " + port);
});