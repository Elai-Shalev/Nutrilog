# Nutrilog

## About The Project 
Nutrilog is a service that lets you upload, document and analyze your everyday meals.
Many people with dietary restricions know the pain of documenting your daily food intake. 
After Elamar noticed her father spending hours in the kitchen weighing is food,  
we knew we could make a solution to alleviate his pain and others' suffering from kidney issues, diabetes and more. 

## Flow of Usage
Upon loading the app, the user is prompted to view their Meal History, or to add a new meal. 
While adding a new meal, the user will weigh his food on the kitchen scale, and will chose between uploading a photo or capturing one in-app. The user can also choose a previously uploaded food-item from their personal collection. 
The app will analyze the meal's title values using a image-processing engine, and will prompt the user to choose the correct food, or add a new option. The app will present the food item's nutritional values, and will calculate the value of the meal given the weigh. 

## Architecture
Nutrilog is a moble app written in React-Native and NodeJS. It implements a camera feature, and integrates with a kitchen scale to let the users weigh and document their food. 

#### FrontEnd
Our app's frontend is written mainly in React-Native, and can be viewed in `App.js`.
Our camera feature implements the `expo-camera` package that activates the iPhones natice camera app
The frontend of the apps connects to our server by using `axios` 

#### BackEnd
Our app implenets a server running in `nodeJS`, and can be viewed in `app.js`.
The server is responsible to connect to the databases, activate the scale, and calling an image-processing tool to analyze the food's title and nutritional values.
The server activates `axios` to communicate with te frontend, the scale and the DB. 
We used `Ninja API` to return food items' nutritional values. 
Our connection strings and public keys are saved in a hidden `.env` file to keep discretion. 

#### IoT Device 
We built a kitchen scale using a [Load Cell, with an HX711AD pressure adapter.](https://shorturl.at/nGOQ7)
We 3D-printed the scale using [this scheme](https://www.thingiverse.com/thing:4602226)
We used an Ardiono-Uno to connect to the scale, and accessed the reading using a serial port. 
The Arduino code made to calibrate and weigh the scale is given in `arduino-weigh.ino`
An WiFi connection was established but not implemented in the delivered project. 

### Databases and Services
We used MongoDB to create a collection of the user's reported personal foods and nutritional values.
We also used a third-party `LogMeal` for implementing Image-Proccessing, 
and used `Ninja` for information about nutritional value


## About Us
All credits go to Elamar Barnea, Eti Daor, and Elai Shalev
-- The triple E's --


