//const scale = require('../Scale/read_scale.js')

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const https = require('https');
const FormData =require('form-data')

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//food image
const img = './uploads/istockphoto-1309352410-612x612.jpg';//change the const
const api_user_token = '1652dedaea11abc60f3090bcf2a49770bcecbbc6';
const headers = { Authorization: `Bearer ${api_user_token}` };

// Food Type Detection
const api_url = 'https://api.logmeal.es/v2';
const endpoint = '/image/segmentation/complete';

// Create a router
const router = express.Router();

const storage = multer.memoryStorage();
//const upload = multer({ storage });
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('photo'), (req, res) => {
  try {
    console.log("received req")
    const photo = req.file;
    //img = photo.path;
    console.log('Received photo:', photo);

    // Handle further processing or storage of the photo
    // For simplicity, we'll just send a response back to the front-end
    res.status(200).json({ message: 'Photo uploaded successfully.' });
  } catch (error) {
    console.error('Error handling photo upload:', error);
    res.status(500).json({ error: 'Error handling photo upload.' });
  }
});

function detectFoodType(){
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

  const req = https.request(options,(res) => {
    res.on('data', (d) =>{
      process.stdout.write(d);
    });
  });

  form.pipe(req);
}

detectFoodType();

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
