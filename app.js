// jshint esversion: 6

// require and configure express
const express = require("express");
const port = 3000;
const app = express();

// require lodash
const _ = require("lodash");

// enable use of local files (css, etc.)
app.use(express.static("public"));

// enable ejs !!! where are we requiring ejs ???
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
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

// compile the schema(s) into a model(s) (model = class/collection to construct documents)
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

// get route(s)
app.get("/", function (req, res) {
    // find all the items
    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log(err + "@ get / route");
        } else {
            // display all the items
            res.render("list", {
                listTitle: weekday + " list",
                listItems: foundItems,
                listName: ""
            });
        }
    });
});

app.get("/:listName", function (req, res) {
    const listName = _.capitalize(req.params.listName);
    // look for the list
    List.findOne({ name: listName }, function (err, foundList) {
        if (err) {
            console.log("ERROR: " + err + " @ get /" + listName + " route");
        } else {
            if (foundList) {
                // render the list if it exists
                res.render("list", {
                    listTitle: listName,
                    listItems: foundList.items,
                    listName: listName
                });
            } else {
                // create a blank list if it doesn't exist
                newList = new List({
                    name: listName,
                    items: []
                });
                newList.save();
                console.log("created " + listName + " list");
                res.redirect("/" + listName);
            }
        }
    });
});

// post route(s)
app.post("/:listName", function (req, res) {
    const listName = _.capitalize(req.params.listName);
    const newItem = new Item({
        name: req.body.newItem
    });

    // handle the delete route
    if (listName === "Delete") {
        const checkedItemID = req.body.checkbox;
        const deleteFromListName = req.body.deleteFromListName;

        // delete if/from root route
        if (deleteFromListName.includes(weekday)) {
            Item.findByIdAndRemove(checkedItemID, function (err) {
                if (!err) {
                    console.log("deleted checked item from root.");
                    res.redirect("/");
                }
            });
        } else {
            // else delete from custom list
            List.findOneAndUpdate(
                { name: deleteFromListName },
                { $pull: { items: { _id: checkedItemID } } },
                function (err, foundList) {
                    if (!err) {
                        console.log("deleted document from " + foundList);
                        res.redirect("/" + deleteFromListName);
                    }
                }
            );
        }
    } else {

        // handle post route(s) other than delete & root
        // see if list already exists

        List.findOne({ name: listName }, function (err, foundList) {
            if (err) {
                console.log(err);
            } else {
                foundList.items.push(newItem);
                foundList.save();
                console.log("added " + newItem + " to " + foundList);
                res.redirect("/" + listName);
            }
        }
        );
    }
});

app.post("/", function (req, res) {
    const newItem = new Item({
        name: req.body.newItem
    });
    newItem.save();
    res.redirect("/");
});

app.listen(port, function () {
    console.log("app running on port " + port);
});