//const scale = require('../Scale/read_scale.js')

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const https = require('https');
const FormData =require('form-data');
const path = require('path');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//food image
//const img = './uploads/istockphoto-1309352410-612x612.jpg';//change the const
const api_user_token = '1652dedaea11abc60f3090bcf2a49770bcecbbc6';
const headers = { Authorization: `Bearer ${api_user_token}` };

// Food Type Detection
const api_url = 'https://api.logmeal.es/v2';
const endpoint = '/image/segmentation/complete';
//topResults = null;

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

function detectFoodType (img){
  console.log("enter to detection food");
  var form = new FormData();
  form.append('image', fs.createReadStream(img));

  var headers = form.getHeaders();
  headers['Authorization'] = 'Bearer 1652dedaea11abc60f3090bcf2a49770bcecbbc6';

  const options = {
    hostname: 'api.logmeal.es',
    path: '/v2/recognition/dish',
    method: 'POST',
    headers: headers,
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', async () => {
      try {
        const jsonResponse = JSON.parse(responseData);

        if (jsonResponse && jsonResponse.recognition_results) {
          const recognitionResults = jsonResponse.recognition_results;

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

router.get('/get-results', async (req, res) => {
    
  try {
  const data = {
      "message": "",
      "results": topResults
  }

  res.setHeader("Content-Type", "application/json")
  res.writeHead(200);
  res.end(JSON.stringify(data,null))
  }
  catch (e){

  }
});


router.get('/start-weigh', async (req, res) => {
    
    try {
    // activate scale function
    //scale.getWeight();
    //let scale_reading = await scale.find_value();
    scale_reading = "2";
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


// Mount the router at a specific base path
app.use('/api', router);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
