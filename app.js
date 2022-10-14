const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const auth = require("./auth");

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

const PORT = 3000;
const _title = "📝 Todo App | v2.0";

//------------------------------------------------------------------------------
// Database --------------------------------------------------------------------
mongoose.connect(`mongodb+srv://${auth.db}:${auth.password}@${auth.user}.7hpvswo.mongodb.net/todoDB`);

const itemsSchema = {
    name: String
  };
  
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
  };
  
const List = mongoose.model("List", listSchema);

const example1 = new Item({
    name: "Welcome to the Todo App!"
})

const example2 = new Item({
    name: "Create your own list!"
});

const example3 = new Item({
    name: "👇type a list name here👇"
})

const default1 = new Item({
    name: "Welcome to your own todolist!"
});

const default2 = new Item({
    name: "Hit the + button to add a new item."
});

const default3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [default1, default2, default3];
const exampleItems = [example1, example2, example3];

//------------------------------------------------------------------------------
// Website  --------------------------------------------------------------------
app.get("/", (req, res) => {
    
    // Item.find({}, (e, foundItems) => {
        
        // if(foundItems.length === 0) {
        //     Item.insertMany(defaultItems, (e) => {
        //         if(e) console.log(e); else console.log("Sucessful saved default items to database.");
        //     });
        //     res.redirect("/");
        // } else {
            res.render("list", {listTitle: _title, newListItems: exampleItems});
        // }
    // });

});

app.post("/", (req, res) => {
  
    const listName = req.body.list;

    if(listName === _title) {
        res.redirect("/" + req.body.newItem);
    } else {
        List.findOne({name: listName}, (e, foundList) => {

            const newItem = new Item({
                name: req.body.newItem
            })

            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});

app.post("/delete", (req, res) => {

    const listName = req.body.listName;

    if(listName === _title) {
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: { _id: req.body.checkbox}}}, (e, foundList) => {
            if(e) console.log(e); else console.log("Successfully deleted checked item.");
        })
    }
    res.redirect("/" + req.body.listName);
})

app.get("/:customListName", (req, res) => {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (e, foundList) => {
        if(!e){ 
            if(!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListName);

            } else {
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
            }
        } else {
            console.log(e);
        }
    });

})
  
app.listen(
    PORT,
    () => console.log(`Connected at: http://localhost:${PORT}`)
);