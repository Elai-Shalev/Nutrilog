const { MongoClient } = require("mongodb");

const dbName = "NutritionalValues"
const url = ""
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
        connect();
        const db = client.db(dbName);
        const collection = db.collection(dbCollection);
        const item = await collection.findOne({ name: {itemName}})
            if (item) {
                console.log("Found item:");
                return item
                } else {
                console.log("Item not found");
            }
        }


    catch (e) {
        console.log(e) 
    }
    finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

// Adds an Item to the Database NutritionalValues. Collection is given as parameter
async function addItem(item, dbCollection) { //new data is a json file. 
    
    try {
        connect();
        const db = client.db(dbName);
        const collection = db.collection(dbCollection);
        const result = await collection.insertOne(item)
        console.log('Item inserted:', result.insertedId);

    }
    catch (e) {
        console.log(e)
    }
    finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
} 

module.exports = {
    connect,
    addItem,
    getItem,
  };


