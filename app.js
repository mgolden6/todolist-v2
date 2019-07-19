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
        required: [true, "need a list name"]
    },
    items: [itemsSchema]
};

// compile the schema(s) into a model(s) (model = class/collection to construct documents)
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

// get route(s)
app.get("/", function (req, res) {
    Item.find({}, function (err, items) {
        if (err) {
            console.log(err + "@ get / route");
        } else {
            console.log("root route items: " + items + " weekday: " + weekday);
            res.render("list", {
                listTitle: weekday + "list",
                itemsList: items,
                listName: ""
            });
        }
    });
});

app.get("/:listName", function (req, res) {
    const listName = req.params.listName;
    List.find({name: listName}, function (err, items) {
        if (err) {
            console.log(err + " @ get /" + listName + " route");
        } else {
            console.log("/" + listName + " route items: " + items);
            res.render("list", {
                listTitle: weekday + " " + listName + " list",
                itemsList: items,
                listName: listName
            });
        }
    });
});

app.post("/:listName", function (req, res) {
    const listName = req.params.listName;

    // handle the delete route
    if (listName === "delete") {
        const checkedItemID = req.body.checkbox;
        Item.findByIdAndRemove(checkedItemID, function (err) {
            if (err) {
                console.log("ERROR: " + err + "@ /delete route");
            } else {
                console.log("successfully deleted document");

                // fix redirect to list that /delete was called from
                res.redirect("/");
            }
        });
    } else {

        // handle non root routes
        const newItem = new Item({
            name: req.body.newItem
        });
        newItem.save();

        List.findOne({ name: listName }, function (err, list) {
            if (err) {
                console.log("ERROR: " + err + " when searching for " + listName + " list");
            } else {
                if (list) {
                    console.log(listName + " list already exists");
                    // save new item to existing list
                    res.redirect("/" + listName);
                } else {
                    // create new list with new item
                    newList = new List({
                        name: listName,
                        items: [newItem]
                    });
                    newList.save();
                    console.log("created " + listName + " list");
                    res.redirect("/" + listName);
                }
            }
        });
    }
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

app.listen(port, function () {
    console.log("app running on port " + port);
});