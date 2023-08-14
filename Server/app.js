//const scale = require("../Scale/read_scale.js"); --complete
const db = require("./DB/db.js")
const env = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const https = require('https');
const FormData =require('form-data');
const path = require('path');
const request = require('request');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Create a router
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Set the destination folder where files will be saved
  },
  filename: function (req, file, cb) {
    cb(null, 'uploaded.jpg'); // Set the filename to 'uploaded.jpg'
  },
});

const upload = multer({ storage: storage });

db.connect(); //Open the DB connection

var wheight = 10;//Change to null --complete
var topResults = null;
var nutrition_values = null;
var last5 = null;

var wheight_done = true;//Change to false --complete
var recognition_done = false;
var nutrition_done = false;

//First we weight the food
router.get('/start-weigh', async (req, res) => {
  try {
  // activate scale function --complete
  //scale.getWeight(); --complete
  scale_reading = "10";
  console.log("the weigh is: " + scale_reading);

  const data = {
    message: "Weigh Done",
    weigh_val: scale_reading,
  };

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify(data, null));
} catch (e) {}
wheight = scale_reading;
wheight_done = true;
});

//In case we want new item we upload the item's photo to the server
router.post('/upload', upload.single('photo'), (req, res) => {
  try {
    console.log("received req")
    const photo = req.file;
    img = photo.path;
    detectFoodType(img);
    console.log('Received photo:', photo);

    res.status(200).json({ message: 'Photo uploaded successfully.' });
  } catch (error) {
    console.error('Error handling photo upload:', error);
    res.status(500).json({ error: 'Error handling photo upload.' });
  }
});

module.exports = router;

//Detect the dish in the image and send 4 options to the user
function detectFoodType (img){
  console.log("enter to detection food");

  var form = new FormData();
  form.append('image', fs.createReadStream(img));

  var headers = form.getHeaders();
  headers['Authorization'] = 'Bearer '+ process.env.API_USER_TOKEN_1;

  const options = {
    hostname: 'api.logmeal.es',
    path: '/v2/recognition/dish',
    method: 'POST',
    headers: headers,
  };

  const req = https.request(options, (res) => {
    console.log("enter req");
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    console.log(responseData);
    res.on('end', async () => {
      try {
        const jsonResponse = JSON.parse(responseData);
        if (jsonResponse && jsonResponse.recognition_results) {
          const recognitionResults = jsonResponse.recognition_results;
          console.log(recognitionResults);
          // Sort recognition results by probability in descending order
          recognitionResults.sort((a, b) => b.prob - a.prob);
          // Get the top 4 recognition results
          topResults = recognitionResults.slice(0, 4);
          console.log("Top 4 Recognition Results:", topResults);
        } else {
          console.error('Recognition results not found in the JSON response.');
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });
  });
  form.pipe(req);
}

//Send the options to the frontend
router.get('/get-results', async (req, res) => {
  if (topResults !== null) {
    var data = {
      "message": "",
      "results": topResults
    };
    res.setHeader("Content-Type", "application/json");
    var jsonData = JSON.stringify(data, null); // Convert the data to JSON string
    res.status(200).json({ status: 'success', data: jsonData }); // Send the response once
  } else {
    res.json({ status: 'processing' });
  }
});

//Receive an option from the user
router.post('/get-option-index', (req, res) => {
  try{
    console.log(req.body);
    console.log(topResults);
    const ind = req.body.option_index;
    const user_option = topResults[ind].name;
    console.log('the users option is ' + user_option);
    recognition_done = true;
    getFoodNutritionValues(user_option);
    res.json({ status: 'success' });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
}
});

//Receive other option from the user
router.post('/get-new-item', (req, res) => {
  try{
    console.log(req.body);
    const user_option = req.body.food_name;
    console.log('the users option is ' + user_option);
    recognition_done = true;
    getFoodNutritionValues(user_option);
    res.json({ status: 'success' });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
}
});


//Send the nutrition values to the frontend
router.get('/get-NutritionValues', async (req, res) => {
  if (nutrition_values !== null) {
    var data = {
      "message": "",
      "nutrition_values": nutrition_values
    };
    res.setHeader("Content-Type", "application/json");
    var jsonData = JSON.stringify(data, null); // Convert the data to JSON string
    res.status(200).json({ status: 'success', data: jsonData }); // Send the response once
  } else {
    res.json({ status: 'processing' });
  }
});

//Get the nutrition values of the option
function getFoodNutritionValues(user_option){
  nutrition_values = null; //check --complete
  while (wheight_done == false){};
  var query = wheight+'g '+user_option;
  request.get({
    url: 'https://api.api-ninjas.com/v1/nutrition?query=' + query,
    headers: {
      'X-Api-Key': process.env.API_USER_TOKEN_2
    },
  }, function(error, response, body) {
    if(error) return console.error('Request failed:', error);
    else if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
    else {
      // Indicates that the item is not in the DB
      // Need to ask from the user to fill the nutritional values
      if (Object.keys(body).length == 2)
      {
        console.log("not found item in DB");
        nutrition_values = "not found";
        return;
      }
      console.log(body)
      nutrition_done = true;
      nutrition_values = JSON.parse(body);
      console.log(nutrition_values);
      const timestamp = new Date().toISOString();
      nutrition_values[0].timestamp = timestamp;
      saveMealToDB(nutrition_values[0]); //save only the first item --complete
    }
  });
}

//Receive an option from the user
router.post('/get-meal-values', (req, res) => {
  try{
    const meal = req.body.meal_values;
    const timestamp = new Date().toISOString();
    meal.timestamp = timestamp;
    console.log(meal);
    addItemToDB(meal,"user_food");
    addItemToDB(meal, "users_history");
    res.json({ status: 'success' });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
}
});

//Save the nutrition values in the meal history DB
function saveMealToDB(item){
  console.log("enter to saveMealToDB")
  if ( wheight_done == false || recognition_done == false || nutrition_done == false ){
     return console.error('Error: whight, food name or nutrinion values are null');
    }
  addItemToDB(item, "users_history");
  console.log(item);
  return item;
}

//Send nutrition values to the frontend
router.get('/get-NutritionValues', async (req, res) => {
  while (nutrition_done == false) {};
  try {
  const data = {
      "message": "",
      "values": nutrition_values
  }

  res.setHeader("Content-Type", "application/json")
  res.writeHead(200);
  res.end(JSON.stringify(data,null))
  }
  catch (e){
  console.error('Error:', error);
  res.status(500).json({ status: 'error', message: 'error sending nutrition values'});
  }
});

//Send the last five meals to the frontend
router.get('/get-history', async (req, res) => {
  last5 = await db.getLastFiveItems("users_history");
  if (last5 !== null) {
    console.log(last5);
    var data = {
      "message": "",
      "lastFiveMeals": last5
    };
    res.setHeader("Content-Type", "application/json");
    var jsonData = JSON.stringify(data, null); // Convert the data to JSON string
    res.status(200).json({ status: 'success', data: jsonData }); // Send the response once
  } else {
    res.json({ status: 'processing' });
  }
});

//Reset the values when user press Back Home
router.get('/reset-values', async (req, res) => {
  try {
    console.log("enter to reset the values");
    wheight = null;
    topResults = null;
    nutrition_values = null;

    wheight_done = false;
    recognition_done = false;
    nutrition_done = false;
  }
  catch (e){
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'error reset values'});
  }
  });

//DB general functions
async function getItemFromDB(itemName, dbCollection) {
  try {
    const item = await db.getItem(itemName, dbCollection);
    return item;
  } catch (e) {
    console.log(e);
  }
}

async function addItemToDB(item, dbCollection) {
  try {
    const addedItem = await db.addItem(item, dbCollection);
    return addedItem;
  } catch (e) {
    console.log(e);
  }
}

// Mount the router at a specific base path
app.use("/api", router);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
