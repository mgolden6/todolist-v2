// jshint esversion: 6

// require and configure express
const express = require("express");
const port = 3000;
const app = express();

// enable use of local files (css, etc.)
app.use(express.static("public"));

// enable ejs
app.set("view engine", "ejs");

// require and configure body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// require custom date module for node, then get weekday
const date = require(__dirname + "/date.js");
const weekday = date.getDay();

// setup the database
// require mongoose
const mongoose = require("mongoose");

// create and connect mongoose to a database
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

//get the status of the mongoose connection to the database
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Mongoose connected!");
});

// build database schema(s)
const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "must include a name"]
    }
});

const listSchema = {
    name: {
        type: String,
        required: [true, "must have a name for each list"]
    },
    items: [itemsSchema]
};

// compile the schema(s) into a model(s) (model = class/collection to construct documents)
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find({}, function (err, items) {
        if (err) {
            console.log(err + "@ get / route");
        } else {

            console.log("items: " + items + " weekday: " + weekday);

            res.render("list", {
                listTitle: weekday,
                itemsList: items
            });
        }
    });

});

app.post("/", function (req, res) {
    const newItem = new Item({
        name: req.body.newItem
    });

    if (req.body.newItemButton === "Work") {
        newItem.save();
        res.redirect("/work");
    } else {
        newItem.save();
        res.redirect("/");
    }
});

app.get("/:listName", function (req, res) {
    const listName = req.params.listName;
    Item.find({}, function (err, items) {
        if (err) {
            console.log(err + " @/" + listName + " route");
        } else {
            console.log("/" + listName + " items " + items);
            res.render("list", {
                listTitle: listName + " list",
                itemsList: items
            });
        }
    });
});

app.post("/work", function (req, res) {
    const newItem = new Item({
        name: req.body.newItem
    });
    newItem.save();
    res.redirect("/work");
});

app.post("/delete", function (req, res) {
    const checkedItemID = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemID, function (err) {
        if (err) {
            console.log(err + "@ /delete route");
        } else {
            console.log("successfully deleted document");
            res.redirect("/");
        }
    });
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(port, function () {
    console.log("app running on port " + port);
});