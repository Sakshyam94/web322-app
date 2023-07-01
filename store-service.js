const fs=require("fs");
let itemsA=[];
let categoriesA=[];


initialize=function(){
    return new Promise((resolve,reject)=>{
        fs.readFile('./data/items.json', 'utf8', (err, itemsdata) => {
            if (err) {
              reject('Unable to read items.json file');
            } else {
              try {
                const itemsArray = JSON.parse(itemsdata);
                itemsA = itemsArray;
                fs.readFile('./data/categories.json','utf8',(err,catdata)=>
                {
                    if(err){
                        reject('Unable to read categories.json file');
                    }else{
                        try{
                            const categArray=JSON.parse(catdata);
                            categoriesA=categArray;
                            resolve();
                        }
                        catch(parseError){
                            reject('Error parsing categories.json file');
                        }
                    }
                });
              } catch (parseError) {
                reject('Error parsing items.json file');
              }
            } 
    })
    });
}

getAllitems=function(){
    return new Promise((resolve,reject)=>{
        if(itemsA.length===0){
            reject('No results returned');
        }
        else{
            resolve(itemsA);
        }
    });
}

getPublishedItems=function(){
    return new Promise((resolve,reject)=>{
        const pItems=itemsA.filter(item=>item.published===true);
        if(pItems.length===0){
            reject('No results returned');
        }
        else{
            
            resolve(pItems);
        }
    });
}

getCategories=function(){
    return new Promise((resolve,reject)=>{
        if(categoriesA.length===0){
            reject('No results returned');
        } else{
            resolve(categoriesA);
        }
        });
}

addItem=function(itemData)
{
    return new Promise((resolve,reject)=>{
        if(itemData.published===undefined){
            itemData.published=false;
        }else{
            itemData.published=true;
        }

        itemData.id=itemsA.length+1;
        itemData.postDate = new Date().toISOString().split('T')[0]; 
        itemsA.push(itemData);

        resolve(itemData);
    });
}

getItemsByCategory=function(category){
    return new Promise((resolve, reject) => {
        if(itemsA.length===0)
        {
            reject("No items found");

        }
        let fitems=itemsA.filter((item)=>item.caregory==category);
        if (fitems.length===0){
            reject("No results returned");
        }else{
            resolve(fitems);
        }
    });
}

getItemsByMinDate=function(minDateStr){

    return new Promise((resolve, reject) => {
        if(itemsA.length===0)
        {
            reject("No items found");

        }
        let fitems=itemsA.filter((item)=>new Date(item.postDate)>=new Date(minDateStr));
        if (fitems.length===0){
            reject("No results returned");
        }else{
            resolve(fitems);
        }
    });
}

getItemById=function(id){
    return new Promise((resolve, reject) => {
        if(itemsA.length===0)
        {
            reject("No items found");

        }
        let fitem=itemsA.filter((item)=>item.id==id);
        if (fitem){
            resolve(fitem);
        }else{
            reject("No result returned");
        }
    });
}

getPublishedItemsByCategory=function(category){
    return new Promise((resolve, reject) => {
        if (itemsA.length === 0) {
          reject("No items found");
        }
    
        let fitems = itemsA.filter((item) => item.category === category && item.published);
        if (fitems.length === 0) {
          reject("No results returned");
        } else {
          resolve(fitems);
        }
      });
}

module.exports={
    initialize,
    getAllitems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemById,
    getItemsByCategory,
    getItemsByMinDate,
    getPublishedItemsByCategory
}