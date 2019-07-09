// jshint esversion: 6

// require and configure express
const express = require("express");
const port = 3000;
const app = express();

// require mongoose
const mongoose = require("mongoose");

// create and connect mongoose to a database
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

// enable ejs
app.set("view engine", "ejs");

// require and configure body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// require custom date module for node
const date = require (__dirname + "/date.js");

// enable use of local files (css, etc.)
app.use(express.static("public"));

// create arrays for each list
const personalItems = [];
const workItems = [];

app.get("/", function (req, res) {

    const weekday = date.getDate();

    res.render("list", {
        listTitle: weekday,
        itemsList: personalItems
    });
});

app.post("/", function (req, res) {

    const newItem = req.body.newItem;

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
    const newItem = req.body.newItem;
    workItems.push(newItem);
    res.redirect("/work");
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(port, function () {
    console.log("app running on port " + port);
});