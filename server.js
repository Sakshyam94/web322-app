/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Sakyam Timilsina Student ID: 155496219 Date: June 16th 2023
*
*  Cyclic Web App URL: https://lazy-pink-lion-hat.cyclic.app/about
* 
*  GitHub Repository URL: https://github.com/Sakshyam94/web322-app
*
********************************************************************************/ 

var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;
const multer=require("multer");
const cloudinary=require('cloudinary').v2;
const streamifier=require('streamifier');
const storeService = require('./store-service');
const upload=multer();
cloudinary.config({
    cloud_name: 'drc17mjcj',
    api_key: '157631916538174',
    api_secret: 'O6WbPI-Hc9_HbgObBts_6WF6uKA',
    secure: true
});


app.use(express.static('public'));
app.get("/", (req, res) => {
  res.redirect("/about");
});
//about
app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/views/about.html");
});


//shop
app.get("/shop",(req,res)=>{
    storeService.getPublishedItems().then((itemsData)=>{
        res.json(itemsData);
    }).catch((error)=>{
        res.status(500).json({message:err});
    });
});
//items
app.get("/items", (req, res) => {
    const category = req.query.category;
    const minDate = req.query.minDate;
  
    if (category) {
      storeService.getItemsByCategory(category)
        .then((fItems) => {
          res.json(fItems);
        })
        .catch((error) => {
          res.status(500).json({ message: error });
        });
    } else if (minDate) {
      storeService.getItemsByMinDate(minDate)
        .then((fItems) => {
          res.json(fItems);
        })
        .catch((error) => {
          res.status(500).json({ message: error });
        });
    } else {
      storeService.getAllitems()
        .then((itemsData) => {
          res.json(itemsData);
        })
        .catch((error) => {
          res.status(500).json({ message: error });
        });
    }
  });
 

  
  app.get("/items/add",(req,res)=>{
    res.sendFile(__dirname+"/views/additem.html");
});

app.post("/items/add",upload.single("featureImage"),(req,res)=>{
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
        // TODO: Process the req.body and add it as a new Item before redirecting to /items
        storeService.addItem(req.body).then(()=>{
            res.redirect("/items");
        })
        } 
});
app.get("/items/:id", (req, res) => {
  const itemId = req.params.id;

  storeService.getItemById(itemId)
    .then((item) => {
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: error });
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




app.use((req,res)=>{
    res.status(404).send('Page Not Found');
});

storeService.initialize().then(()=>{
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on http/localhost:" + HTTP_PORT);
    });
    
}).catch((error)=>{
    console.error('Error in initializing Store Service');
});
