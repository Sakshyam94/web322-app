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
module.exports={
    initialize,
    getAllitems,
    getPublishedItems,
    getCategories
}