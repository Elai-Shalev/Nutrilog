const express = require('express');

const app = express();
app.use(express.json());

// Create a router
const router = express.Router();

// Define routes using the router
router.get('/requestWeigh', (req, res) => {
  res.json({ message: 'Sending the weigh...' });
});

router.post('/upload-photo', (req, res) => {
  const { photo } = req.body;

  // Convert the base64 image to a Buffer
  const imageData = Buffer.from(photo, 'base64');

  console.log('Received image data:', imageData.length);

  res.send(`Hello, client! This is a POST request. Received data: ${photo}`);
});

// Mount the router at a specific base path
app.use('/api', router);

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
