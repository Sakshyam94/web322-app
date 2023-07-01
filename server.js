/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Sakyam Timilsina Student ID: 155496219 Date: June 30th 2023
*
*  Cyclic Web App URL: https://lazy-pink-lion-hat.cyclic.app/Shop
* 
*  GitHub Repository URL: https://github.com/Sakshyam94/web322-app
*
********************************************************************************/ 

var express = require("express");
var exphbs=require('express-handlebars');
var {SafeString}=require('handlebars');
var app = express();

app.engine('.hbs', exphbs.engine({extname: '.hbs'
,helpers:{
  navLink: function(url,options)
{
  return(
    '<li class="nav-item"><a '+
    (url==app.locals.activeRoute?'class="nav-link active"':'class="nav-link" '+
    'href="'+
    url+
    '">'+
    options.fn(this)+
    "</a><li>")
  );
},
equal: function (lvalue, rvalue, options) {
  if (arguments.length < 3)
  throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
  return options.inverse(this);
  } else {
  return options.fn(this);
  }
 },
 safeHTML: function (content) {
  return new SafeString(content);
}
}}));
app.set('view engine', '.hbs');

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

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
 });



app.get("/", (req, res) => {
  res.redirect("/shop");
});
//about
app.get("/about", (req, res) => {
  res.render('about');
});


//shop
app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let items = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await storeService.getPublishedItems();
    }

    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = items[0];

    // store the "items" and "post" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await storeService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          items = await storeService.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          items = await storeService.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await storeService.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

//items
app.get("/items", (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    storeService.getItemsByCategory(category)
      .then((fItems) => {
        res.render("items", { items: fItems });
      })
      .catch((error) => {
        res.render("items", { message: "no results" });
      });
  } else if (minDate) {
    storeService.getItemsByMinDate(minDate)
      .then((fItems) => {
        res.render("items", { items: fItems });
      })
      .catch((error) => {
        res.render("items", { message: "no results" });
      });
  } else {
    storeService.getAllitems()
      .then((itemsData) => {
        res.render("items", { items: itemsData });
      })
      .catch((error) => {
        res.render("items", { message: "no results" });
      });
  }
});
 

  
  app.get("/items/add",(req,res)=>{
    res.render("additem");
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
      res.render("categories", {categories: categoriesData});
    }).catch((error)=>{
      res.render("categories",
      {message: "no results"});
    });
});




app.use((req,res)=>{
    res.status(404).render('404');
});

storeService.initialize().then(()=>{
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on http/localhost:" + HTTP_PORT);
    });
    
}).catch((error)=>{
    console.error('Error in initializing Store Service');
});
