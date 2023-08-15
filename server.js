/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: Sakshyam Timilsina Student ID: 155496219 Date: 14th August 2023
*
*  Cyclic Web App URL: https://lazy-pink-lion-hat.cyclic.app/about
*
*  GitHub Repository URL: https://github.com/Sakshyam94/web322-app
*
********************************************************************************/
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();

const multer = require("multer");
const upload = multer();

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const clientSessions = require("client-sessions");

var itemData = require("./store-service");
var authData = require("./auth-service");

const exphbs = require("express-handlebars");
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          '<li class="nav-item"><a ' +
          (url == app.locals.activeRoute
            ? ' class = "nav-item active" '
            : ' class = "nav-link" ') +
          ' href =" ' +
          url +
          '"> ' +
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
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);

app.set("view engine", ".hbs");

cloudinary.config({
  cloud_name: "drc17mjcj",
  api_key: "157631916538174",
  api_secret: "6WbPI-Hc9_HbgObBts_6WF6uKA",
  secure: true,
});

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


app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "HaolinYang112654223",
    duration: 10 * 60 * 1000,
    activeDuration: 10 * 60 * 1000,
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.get("/", (req, res) => {
  res.redirect("/shop");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/shop", async (req, res) => {

  let viewData = {};
  try {

    let items = [];

    if (req.query.category) {

      items = await itemData.getPublishedItemsByCategory(
        req.query.category
      );
    } else {

      items = await itemData.getPublishedItems();
    }

    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    let item = items[0];

    viewData.items = items;
    viewData.item = item;
  } catch (err) {
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

app.get("/shop/:id", async (req, res) => {
  let viewData = {};

  try {

    let items = [];

    if (req.query.category) {

      items = await itemData.getPublishedItemsByCategory(
        req.query.category
      );
    } else {

      items = await itemData.getPublishedItems();
    }
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    viewData.items = items;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    viewData.item = await itemData.getItemById(req.params.id);
  } catch (err) {
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


app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        username: user.username,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      console.log(user)
      res.redirect("/items");
    })
    .catch((err) => {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  const userData = {
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    password2: req.body.password2,
    userAgent: req.headers["user-agent"],
  };

  authData
    .registerUser(userData)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.get("/items", ensureLogin, (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    itemData
      .getItemsByCategory(category)
      .then((data) => {
        if (data.length > 0) {
          res.render("items", { items: data });
        } else {
          res.render("items", { message: "no results" });
        }
      })
      .catch((error) => {
        console.error("Failed to get items of selected category:", error);
        res.render("items", { message: "no results" });
      });
  } else if (minDate) {
    itemData
      .getItemsByMinDate(minDate)
      .then((data) => {
        if (data.length > 0) {
          res.render("items", { items: data });
        } else {
          res.render("items", { message: "no results" });
        }
      })
      .catch((error) => {
        console.error("Failed to get items of selected minDate:", error);
        res.render("items", { message: "no results" });
      });
  } else {
    itemData
      .getAllItems()
      .then((data) => {
        if (data.length > 0) {
          res.render("items", { items: data });
        } else {
          res.render("items", { message: "no results" });
        }
      })
      .catch((error) => {
        console.error("Failed to get categories:", error);
        res.render("items", { message: "no results" });
      });
  }
});

app.get("/items/add", ensureLogin, (req, res) => {
  itemData
    .getCategories()
    .then((categories) => {
      res.render("addItem", { categories });
    })
    .catch((error) => {
      console.error("Failed to get categories:", error);
      res.render("addPost", { categories: [] });
    });
});

app.post(
  "/items/add",
  ensureLogin,
  upload.single("featureImage"),
  (req, res) => {

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
        .then(() => {
          res.redirect("/items");
        })
        .catch((err) => {
          console.error("Failed to add item:", err);
          res.render("items", { message: "no results" });
        });
    }
  }
);

app.get("/item/:id", ensureLogin, (req, res) => {
  const itemId = req.params.id;
  itemData
    .getItemById(itemId)
    .then((data) => {
      if (data) {
        res.render("items", { items: data });
      } else {
        res.render("items", { message: "Item not found" });
      }
    })
    .catch((error) => {
      console.error("Failed to get item of this id:", error);
      res.render("items", { message: "no results" });
    });
});

app.get("/items/delete/:id", ensureLogin, (req, res) => {
  let itemId = req.params.id;
  itemData
    .deletePostById(itemId)
    .then(() => {
      res.redirect("/items");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

app.get("/categories", ensureLogin, (req, res) => {
  itemData
    .getCategories()
    .then((data) => {
      if (data.length > 0) {
        res.render("categories", { categories: data });
      } else {
        res.render("categories", { message: "no results" });
      }
    })
    .catch((error) => {
      console.error("Failed to get categories:", error);
      res.render("categories", { message: "no results" });
    });
});

app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", ensureLogin, (req, res) => {
  let formData = req.body;

  itemData
    .addCategory(formData)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      console.error("Failed to add category:", err);
      res.redirect("/categories");
    });
});

app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  let catId = req.params.id;
  itemData
    .deleteCategoryById(catId)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

app.get("*", (req, res) => {
  res.status(404).render("404");
});

itemData.initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Express http server listening on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => "Server failed to init from: " + err);