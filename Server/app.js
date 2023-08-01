const scale = require('../Scale/read_scale.js')
const db = require("./db/db.js")

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const { userInfo } = require('os');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a router
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', (req,res) => {
  res.send("UP")
})

// Recieves a photo in __ format, does [..] with it
router.post('/upload-photo', (req, res) => {
  console.log("before try")
  try {
    console.log("entered")
    console.log("body")
    //console.log(req.body)
    //console.log(req.body.body)
    //console.log(req.body.body._parts)
    //console.log(req.body.body._parts[0][1]._data)

    //const photo_buffer = req.file.buffer;
    const file = req.files.file;

    console.log("converted")
    /*
    const base64Data = req.body.image; // Assuming req.body.image contains the base64 string
    const imageDatabuffer = Buffer.from(base64Data, 'base64');
    const filename = 'testi.png';
    fs.writeFileSync(filename, imageDatabuffer, 'base64');
    */
    const filename = 'new_from_blob.jpg'
    fs.writeFileSync(filename, file, (err) => {
        if (err) {
          console.error('Error saving the photo:', err);
          res.status(500).json({ error: 'Failed to save the photo' });
        } else {
          console.log('Photo saved successfully');
          res.json({ message: 'Photo uploaded and saved' });
        }
      });
    console.log("writed")

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
  res.end("goodbye")
});

// Starts weigh from device, return the result to App
router.get('/start-weigh', async (req, res) => {
    
    try {
    // activate scale function
    scale.getWeight();
    let scale_reading = await scale.find_value();
    console.log("the weigh is: " + scale_reading)
    

    const data = {
        "message": "Weigh Done",
        "weigh_val": scale_reading
    }

    res.setHeader("Content-Type", "application/json")
    res.writeHead(200);
    res.end(JSON.stringify(data,null))
    }
    catch (e){

    }
});

// Recieves an item to add to DB. will always add to user_food collection
router.post('/addItem', async (req,res) => {
// app request is in this format: await axios.post('url', json={name: "Waffles", calories: 345, sodium: "24.00 mg" ...})
  try{
    const newItem = req.body;
    await db.addItem(newItem, "user_food"); //module db function
    res.send("Item added to Database")
  }
  catch (e) {
    console.log(e)
  }
})

router.post('/getUserFood', async (req, res) => {
  try {
    // req head is "Content-Type: application/json"
    // req data is {"name": "Nuts, pecans"} 
    // url 
    const item_name = req.body.name //the name filed in the data json beinf transfered
    const item_info = await getItemFromDB(req.body.string, "user_food")
    if (!item) {
      res.end("No Item in DB")
    } else {
      res.setHeader("Content-Type", "application/json")
      res.writeHead(200);
      res.end(JSON.stringify(item_info,null))
    }
  }
  catch (e) {
    console.log(e)
  }
});

router.post('/getBasicFood', async (req, res) => {
  try { 
    const item_name = req.body.name
    const item_info = await getItemFromDB(item_name, "basic_food")
    if (!item_info) {
      res.end("No Item in DB")
    } else {
      res.setHeader("Content-Type", "application/json")
      res.writeHead(200);
      res.end(JSON.stringify(item_info,null))
    }
    
  }
  catch (e) {
    console.log(e)
  }
});

async function getItemFromDB(itemName, dbCollection){
  try{
    item = await db.getItem(itemName, dbCollection)
    return item 

  }
  catch (e) {
    comsole.log(e)
  }

}

// Mount the router at a specific base path
app.use('/api', router);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
