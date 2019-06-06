// jshint esversion: 6

const express = require("express");
const port = 3000;
const app = express();

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

let personalItems = [];
let workItems = [];

app.get("/", function (req, res) {

    let today = new Date();
    let options = {
        weekday: "long",
        month: "long",
        day: "numeric"
    };

    let weekday = today.toLocaleDateString("en-US", options);
    res.render("list", {
        listTitle: weekday,
        itemsList: personalItems
    });
});

app.post("/", function (req, res) {

    let newItem = req.body.newItem;

    if (req.body.newItemButton === "Work") {
        workItems.push(newItem);
        res.redirect("/work");
    } else {
        personalItems.push(newItem);
        res.redirect("/");
    }
});

app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work list",
        itemsList: workItems
    });
});

app.post("/work", function (req, res) {
    let newItem = req.body.newItem;
    workItems.push(newItem);
    res.redirect("/work");
});

app.listen(port, function () {
    console.log("app running on port " + port);
});