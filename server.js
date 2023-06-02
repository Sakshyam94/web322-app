/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Sakshyam Timilsina
Student ID: 155496219
Date: 2nd June
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: ______________________________________________________

********************************************************************************/ 

var express = require("express");
var app = express();
var itemsData=require('./data/items.json');
var categoriesData=require('./data/categories.json');
const storeService = require('./store-service');
// Set the port to process.env.PORT or 8080
var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
//shop
app.get("/shop",(req,res)=>{
    storeService.getPublishedItems().then((itemsData)=>{
        res.json(itemsData);
    }).catch((error)=>{
        res.status(500).json({message:err});
    });
});
//items
app.get("/items",(req,res)=>{
    storeService.getAllitems().then((itemsData)=>{
        res.json(itemsData);
    }).catch((error)=>{
        res.status(500).json({message:err});
    });
});
//categories
app.get("/categories",(req,res)=>{
    storeService.getCategories().then((categoriesData)=>{
        res.json(categoriesData);
    }).catch((error)=>{
        res.status(500).json({message:err});
    });
});
// Redirect the root URL ("/") to the "/about" route
app.get("/", (req, res) => {
    res.redirect("/about");
});

// Return the about.html file from the 'views' folder
app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/views/about.html");
});

app.use((req,res)=>{
    res.status(404).send('Page Not FOund');
});
// Start the server and listen on the specified port

storeService.initialize().then(()=>{
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on " + HTTP_PORT);
    });
    
}).catch((error)=>{
    console.error('Error in initializing Store Service');
});
