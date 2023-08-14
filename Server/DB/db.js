const { MongoClient } = require("mongodb");
const env = require('dotenv').config();

const dbName = "NutritionalValues"
const url = process.env.MONGODB_URL
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//connects to the MongoDB server
async function connect() {
    try {
        await client.connect();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

// Returns an Item from the Database NutritionalValues. Collection is given as parameter.
async function getItem(itemName, dbCollection){

    try {
        const db = client.db(dbName);
        const collection = db.collection(dbCollection);
        const item = await collection.findOne({ name: itemName})
            if (item) {
                console.log("Found item: ", item.name);
                return item
                } else {
                console.log("Item not found");
            }
        }
    catch (e) {
        console.log(e) 
    }
}

// Adds an Item to the Database NutritionalValues. Collection is given as parameter
async function addItem(item, dbCollection) { //new data is a json file. 
    
    try {
        const db = client.db(dbName);
        const collection = db.collection(dbCollection);
        const result = await collection.insertOne(item)
        console.log('Item inserted:', result.insertedId);

    }
    catch (e) {
        console.log(e)
    }
} 

async function getLastFiveItems(dbCollection) {
  
    try {

      const db = client.db(dbName);
      const collection = db.collection(dbCollection);
  
      const cursor = collection.find().sort({ timestamp: -1 }).limit(5);
      const lastFiveItems = await cursor.toArray();
      return lastFiveItems;
    } catch (error) {
      console.error('Error:', error);
      return [];
    } finally {
      client.close();
    }
  }

module.exports = {
    connect,
    addItem,
    getItem,
    getLastFiveItems,
  };

