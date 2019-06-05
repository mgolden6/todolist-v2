// jshint esversion: 6

const express = require("express");
const port = 3000;
const app = express();

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

let items = [];

app.get("/", function (req, res) {

    let today = new Date();
    let options = {
        weekday: "long",
        month: "long",
        day: "numeric"
    };

    let weekday = today.toLocaleDateString("en-US", options);
    res.render("list", {
        kindOfDay: weekday,
        itemsList: items
    });
});

app.post("/", function (req, res) {
    let newItem = req.body.newItem;
    items.push(newItem);
    console.log(items);

    res.redirect("/");
});

app.listen(port, function () {
    console.log("app running on port " + port);
});