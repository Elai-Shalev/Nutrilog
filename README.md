# Nutrilog  :apple:

## About The Project 
Nutrilog is a service that lets you upload, document, and analyse your everyday meals.
Many people with dietary restrictions know the pain of documenting your daily food intake. 
After Elamar noticed her father spending hours in the kitchen weighing is food, we knew we could make a solution to alleviate his pain and others' suffering from kidney issues, diabetes and more. 

## Flow of Usage
Upon loading the app, the user is prompted to view their meal history, or to add a new meal. 
While adding a new meal, the user will weigh his food on the kitchen scale, and will capture a photo of his food. The user can also choose a previously uploaded food-item from their personal collection.  
The app will analyse the meal's title values using an image-processing engine and will prompt the user to choose the correct food, or add a new option with it's nutritional values. The app will present the food item's nutritional values and will calculate the value of the meal given the weigh. 

## Architecture
Nutrilog is a mobile app written in React-Native and NodeJS. It implements a camera feature and integrates a kitchen scale to let the users weigh and document their food. 

#### FrontEnd
Our app's frontend is written mainly in React-Native and can be viewed in `NutrilogUI/App.js`.
Our camera feature implements the `expo-camera` package that activates the iPhone's native camera app. :camera_flash:
The frontend of the apps connects to our server by using `axios`. 

#### BackEnd
Our app implements a server running in `nodeJS` and can be viewed in `Server/app.js`.
The server is responsible to connect to the databases, activate the scale, and call an image-processing tool. The server analyses the food's title and it's nutritional values.
The server activates `axios` to communicate with the frontend, the scale, and the DB. 
We used `Ninja API` to return food items' nutritional values. 
Our connection strings and public keys are saved in a hidden `.env` file to keep discretion. 

#### IoT Device 
We built a kitchen scale using a [Load Cell, with an HX711AD pressure sensor adapter.](https://shorturl.at/nGOQ7)
We 3D-printed the scale using [this scheme.](https://www.thingiverse.com/thing:4602226)
We used an Arduino-Uno to connect to the scale and accessed the reading using a serial port. 
The Arduino code made to calibrate and weigh the scale is given in `arduino-weigh.ino`
A WiFi connection to the scale was established but not implemented in the delivered project. 

#### Databases and Services
We used MongoDB to create a databse and host two collections:
 - `user_food:` A collection of the user's reported personal foods and nutritional values.
 - `users_history:` A collection of the user's history of reported meals.  
We also used a third-party `LogMeal` for implementing Image-Processing, 
and used `Ninja` for information about nutritional values.

## About Us
All credits go to Elamar Barnea, Eti Daor, and Elai Shalev
-- The triple E's --



