const Sequelize = require('sequelize');
var sequelize = new Sequelize('vztpjmrs', 'vztpjmrs', 'RzTTStbrxhcaVEughOnWGP6j_vA7NRWt', {
    host: 'lallah.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});
sequelize
    .authenticate()
    .then(function () {
        console.log('Connection has been established successfully.');
    })
    .catch(function (err) {
        console.log('Unable to connect to the database:', err);
    });

    var Item = sequelize.define('Item', {
        body: Sequelize.TEXT,
        title: Sequelize.STRING,
        postDate: Sequelize.DATE,
        featureImage:Sequelize.STRING,
        published:Sequelize.BOOLEAN,
        price:Sequelize.DOUBLE
    });

    
    var Category = sequelize.define('Category', {
        category:Sequelize.STRING
    });

    Item.belongsTo(Category, {foreignKey: 'category'});
    

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                console.log('Database synced successfully!');
                resolve();
            })
            .catch((err) => {
                console.error('Unable to sync the database:', err);
                reject("unable to sync the database");
            });
    });
}


module.exports.getItemById = function(id){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                id: id
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items[0]);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching item by id:', err);
                reject('no results returned');
            });
    });
}

module.exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        Item.findAll()
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching items:', err);
                reject('no results returned');
            });
    });
}

module.exports.getPublishedItems = function(){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                published: true
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching published items:', err);
                reject('no results returned');
            });
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((categories) => {
                if (categories.length > 0) {
                    resolve(categories);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching categories:', err);
                reject('no results returned');
            });
    });
}

module.exports.addItem = function(itemData){
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;

        for (let i in itemData) {
            if (itemData[i] === "") {
                itemData[i] = null;
            }
        }

        itemData.postDate = new Date();

        Item.create(itemData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                console.error('Error while adding item:', err);
                reject('unable to create post');
            });
    });
}

module.exports.getItemsByCategory = function(category1){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                category: category1
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching items by category:', err);
                reject('no results returned');
            });
    });
}
const {gte}=Sequelize.Op;
module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching items by min date:', err);
                reject('no results returned');
            });
    });
}

module.exports.getPublishedItemsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        Item.findAll({
            where: {
                published: true,
                categoryId: category
            }
        })
            .then((items) => {
                if (items.length > 0) {
                    resolve(items);
                } else {
                    reject('no results returned');
                }
            })
            .catch((err) => {
                console.error('Error while fetching published items by category:', err);
                reject('no results returned');
            });
    });
}
module.exports.addCategory=function(categoryData){
    return new Promise((resolve, reject) => {
        for (let i in categoryData) {
            if (categoryData[i] === "") {
                categoryData[i] = null;
            }
        }
    
        Category.create(categoryData)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            console.error("Error while creating category:", err);
            reject("unable to create category");
          });
      });
}
module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
      Category.destroy({
        where: {
          id: id,
        },
      })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) {
            resolve();
          } else {
            reject("category not found");
          }
        })
        .catch((err) => {
          console.error("Error while deleting category:", err);
          reject("unable to delete category");
        });
    });
  };

  module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject) => {
      Item.destroy({
        where: {
          id: id,
        },
      })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) {
            resolve();
          } else {
            reject("item not found");
          }
        })
        .catch((err) => {
          console.error("Error while deleting item:", err);
          reject("unable to delete item");
        });
    });
  };