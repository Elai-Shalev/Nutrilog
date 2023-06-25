const { MongoClient } = require("mongodb").MongoClient;

const dbName = "NutritionalValues"
const dbCollection = "basic_food"
const url = 'mongodb+srv://elaishalev:DUG1pRJIwpxDW6nv@nutrilog.bjnpma1.mongodb.net/';
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function connect() {
    try {
        await client.connect();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

async function getItem(name){

    const db = client.db(dbName);
    const collection = db.collection(dbCollection);

    try {
        const item = await collection.findOne({ name: {name}})
        if (item) {
            console.log("Found item:", food);
          } else {
            console.log("Item not found");
        }
        // continue
    }

    catch (e) {
        // fill in 
    }
}

async function addItem(data) { //new data is a json file. 
    // add to a different collection on "personal foods". 
} 

module.exports = {
    connect,
    addItem,
    getItem,
  };


