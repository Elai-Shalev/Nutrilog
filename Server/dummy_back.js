const express = require('express');
const ip = require('ip');
const dotenv = require('dotenv');
const { ObjectId } = require('mongodb');
//const monoose = require('mongoose');
let MongoClient = require("mongodb").MongoClient;

const dbName = "NutritionalValues"
const db_collection = "basic_food"

const url = 'mongodb+srv://elai-shalev:83ty07h3DGa9HJ0r@nutrilog.bjnpma1.mongodb.net/';
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


dotenv.config();
const PORT = process.env.SERVER_PORT || 3001;
const app = express();
app.use(express.json());

app.get('/', (req,res) => {res.send( { message: "UP" })});


app.get('/get', async (req,res) => {

    try {
        await client.connect();
        console.log("Connected to db")
        const db = client.db(dbName);
        console.log("found client name")
        const collection = db.collection(db_collection)
        console.log("found collection")
        //find all foods: 
        const food = await collection.findOne({ calories: 272})
        if (food) {
            console.log("Found item:", food);
          } else {
            console.log("Item not found");
        }
        
    }
    catch (e) {
        console.error(e)
    }
    res.send("Done with db")
})

app.listen(PORT, () => console.log(`Server running on: ${ip.address()}:${PORT}`));




