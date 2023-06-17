const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a router
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/upload-photo', (req, res) => {
  console.log("before try")
  try {
    console.log("entered")
    console.log("body")
    console.log(req.body)
    console.log(req.body.body)
    console.log(req.body.body._parts)
    console.log(req.body.body._parts[0][1]._data)

    const blob = req.file.buffer;
    console.log("converted")
    /*
    const base64Data = req.body.image; // Assuming req.body.image contains the base64 string
    const imageDatabuffer = Buffer.from(base64Data, 'base64');
    const filename = 'testi.png';
    fs.writeFileSync(filename, imageDatabuffer, 'base64');
    */
    const filename = 'new_from_blob.jpg'
    fs.writeFile(filename, blob, (err) => {
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

router.get('/start-weigh', (req, res) => {
    
    // activate scale function
    let scale_reading = '2'; // function reading
    res.json({message: 'Weight done', weigh_val: {scale_reading}})
    
});

router.get('/identify-food', (req, res) => {

});

// Mount the router at a specific base path
app.use('/api', router);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
