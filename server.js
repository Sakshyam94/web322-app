/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Sakshyam Timilsina Student ID: 155496219 Date: 21st July 2023
*
*  Cyclic Web App URL: https://lazy-pink-lion-hat.cyclic.app/about
*
*  GitHub Repository URL: https://github.com/Sakshyam94/web322-app
*
********************************************************************************/ 

const express = require("express");
const itemData = require("./store-service");
const path = require("path");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const exphbs = require("express-handlebars");
const { Console } = require("console");


cloudinary.config({
  cloud_name: "drc17mjcj",
  api_key: "157631916538174",
  api_secret: "6WbPI-Hc9_HbgObBts_6WF6uKA",
  secure: true,
});


const upload = multer(); 

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.use(express.urlencoded({extended:true}));

app.use(function (req, res, next) {
  let route = req.path.substring(1);

  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));

  app.locals.viewingCategory = req.query.category;

  next();
});

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          '<li class="nav-item"><a ' +
          (url == app.locals.activeRoute
            ? ' class="nav-link active" '
            : ' class="nav-link" ') +
          ' href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
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
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }    
    },
  })
);

app.set("view engine", ".hbs");

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/shop", async (req, res) => {

  let viewData = {};

  try {

    let items = [];

    if (req.query.category) {

      console.log('categories');
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {

      items = await itemData.getPublishedItems();
    }

    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    let item = items[0];

    viewData.items = items;
    viewData.item = item;

  } 
  catch (err) {
    viewData.message = "no results";
  }

  try {

    let categories = await itemData.getCategories();

    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render("shop", { data: viewData });
});

app.get("/items", (req, res) => {
  let queryPromise = null;

  if (req.query.category) {
    queryPromise = itemData.getItemsByCategory(req.query.category);
  } else if (req.query.minDate) {

    queryPromise = itemData.getItemsByMinDate(req.query.minDate);
  } else {

    queryPromise = itemData.getAllItems();
  }

  queryPromise
    .then((data) => {
      if (data.length > 0) {
        res.render("items", { items: data });
      } else {
        res.render("items", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("items", { message: "no results" });
    });
});


app.get("/items/add", (req, res) => {
  itemData.getCategories()
  .then((categories) => {
    res.render("addItem", { categories:data });
  })
  .catch((err) => {
    res.render("addItem", { categories: [] });
  });
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);

      console.log(result);

      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    itemData
      .addItem(req.body)
      .then((post) => {
        res.redirect("/items");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});
app.get("/item/:id", (req, res) => {
  itemData
    .getItemById(req.params.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/items/delete/:id", (req, res) => {
  const itemId = parseInt(req.params.id);
  itemData
    .deletePostById(itemId)
    .then(() => {
      res.redirect("/items");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Item / Item not found");
    });
});

app.get("/categories", (req, res) => {
  itemData
    .getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", (req, res) => {

  itemData
    .addCategory(req.body)
    .then(() => {

      res.redirect("/categories");
    })
    .catch((err) => {

      res.status(500).send(err);
    });
});

app.get("/categories/delete/:id", (req, res) => {
  const categoryId = parseInt(req.params.id);
  itemData
    .deleteCategoryById(categoryId)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

app.get('/shop/:id', async (req, res) => {

  let viewData = {};

  try{
      let items = [];
      if(req.query.category){

          items = await itemData.getPublishedItemsByCategory(req.query.category);
      }else{
          items = await itemData.getPublishedItems();
      }

      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{

      viewData.item = await itemData.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      let categories = await itemData.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }
  res.render("shop", {data: viewData})
});

app.use((req, res) => {
  res.status(404).render("404");
})

itemData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("server listening on: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
