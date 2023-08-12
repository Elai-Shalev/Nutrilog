import { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
} from "react-native";
import Header from "./src/header";
import { Camera } from "expo-camera";
import CameraPreview from "./src/CameraPreview";
import axios from "axios";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button as Btn, Badge, ButtonGroup } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";

export default function App() {
  const [startCamera, setStartCamera] = useState(false); //Bollean - sets the permission to start taking a picture
  const [previewVisible, setPreviewVisible] = useState(false); //Bollean - after taking a picture the picture is availble for preview
  const [photoChosen, setPhotoChosen] = useState(false); //Bollean - after preview the user chose this photo to be further used
  const [foodCurrentlyWeighted, setFoodCurrentlyWeighted] = useState(false); //Bolean - user starts weigh and we're waiting for server's answer
  const [doneWeighting, setDoneWeighting] = useState(false); //Bolean - got an answer from the server about weight and can show it
  const [savedWeight, setSavedWeight] = useState(null); //String - has the weight value in it
  const [savedPhoto, setSavedPhoto] = useState(null); //Png- saves the picture the user took
  const [historyPageReq, setHistoryReq] = useState(false); //Request to history page
  const [NewMealRequest, setNewMealRequest] = useState(false); //Request to new meal
  const [FromDataOption, setFromDataOption] = useState(false); //Selecting from data and not from photo
  const [WaitForOptions, setWaitForOptions] = useState(false);
  const [ReceievedOptionsFromBack, setReceivedOptionsFromBack] = useState(false);
  const [Option1FromPhotoAnalysis, setOption1FromPhotoAnalysis] = useState(1);
  const [Option2FromPhotoAnalysis, setOption2FromPhotoAnalysis] = useState(2);
  const [Option3FromPhotoAnalysis, setOption3FromPhotoAnalysis] = useState(3);
  const [Option4FromPhotoAnalysis, setOption4FromPhotoAnalysis] = useState(4);
  const [optionChosenFromList, setoptionChosenFromList] = useState(null);
  let camera;

  //*****************************************************************************
  //*******************************Functions:************************************
  //*****************************************************************************

  //This function is triggred when pressing "Add a meal"
  //If premission is allowed will further let us take a photo with setting startCamera as True
  const requestPermission = async () => {
    setNewMealRequest(false);
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status === "granted") {
      setStartCamera(true);
    } else {
      Alert.alert("Access Denied!");
    }
  };

  const historyPage = () => {
    setHistoryReq(true);
  };

  const newMeal = () => {
    setNewMealRequest(true);
  };

  const chooseFromData = () => {
    setFromDataOption(true);
  };

  //This is triggerd within the camera component inside the view
  const takePicture = async () => {
    if (!camera) return
    const options = { quality: 0.01};
    const photo = await camera.takePictureAsync(options);
    setSavedPhoto(photo)
    setPreviewVisible(true)
    setStartCamera(false)
  }

  //This is triggered within the clear picture button
  const clearPhoto = () => {
    setSavedPhoto(null);
    setPreviewVisible(false);
  };

  //This is triggres within the keep picture button
  //THIS FUNCTION WILL DELIVER THE PHOTO TO BACK
  //This function will also get back the results
  const usePhoto = async () => {
    setWaitForOptions(true);
    setPhotoChosen(true);
    setPreviewVisible(false);

    try {
      const photoData = new FormData();
      photoData.append('photo', {
        uri: savedPhoto.uri,
        name: 'photo.jpg',
        type: 'image/jpg',
      });
      const response = await axios.post('http://192.168.31.158:3000/api/upload', photoData);
      console.log('Photo uploaded successfully:', response.data);
      pollForResult();
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  }

  
  async function pollForResult() {
    await axios
      .get('http://192.168.31.158:3000/api/get-results')
      .then(response => {
        const data = response.data;
        if (data.status === 'success') {
          // Process the received result from the server
          console.log("received data");
          console.log(data.data);
          const topResults = data.data.results;
          console.log(topResults);
  
          // Assuming these lines are related to handling the received data
          setOption1FromPhotoAnalysis(topResults[0].name);
          setOption2FromPhotoAnalysis(topResults[1].name);
          setOption3FromPhotoAnalysis(topResults[2].name);
          setOption4FromPhotoAnalysis(topResults[3].name);
          setReceivedOptionsFromBack(true);
          setWaitForOptions(false);
        } else if (data.status === 'processing') {
          console.log("still processing");
          // If still processing, continue polling
          setTimeout(pollForResult, 1000); // Poll every 1 second
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
 
  //Send the user's option to the backend --complete
   //inside- ask for the nutritional values of the food

  //Receive the nutrition values from the backend 
  async function getNutritionValuesFromServer(){
    try {
      console.log("enter getNutritionValues"); //check if can e removed --complete
      const response = await axios.get('http://192.168.31.158:3000/api/get-NutritionValues');
      const nutrition_values = response.data.values;

      console.log('The Nutrition Values are :', nutrition_values);
    } catch (error) {
      console.error('Error getting Nutrition Values:', error);
    }
  }

  //This function us triggered by "weigh now" button
  //It sends a request to weigh to the back end and gets the result and displays it
  const getWeight = async() => {
    setFoodCurrentlyWeighted(true)
    try{
      answer = await axios.get('http://192.168.31.158:3000/api/start-weigh');
      weight = answer.data.weigh_val
    }
    catch (e){
      console.log(e)
      Alert.alert("couldn't connect to server")
      BackHome()
    }
    setFoodCurrentlyWeighted(false);
    setDoneWeighting(true);
    // setSavedWeight(answer); --complete
    setSavedWeight(weight);
  };

  const BackHome = () => {
    setPhotoChosen(false);
    setDoneWeighting(false);
    setSavedWeight(null);
    setHistoryReq(false);
    setNewMealRequest(false);
    setFromDataOption(false);
  };

  //*****************************************************************************
  //*********************************View:***************************************
  //*****************************************************************************

  //These are the view properties. each wil be either shown or not with conditions:
  //Those are set by the bollean startCamera and previewVisible
  //**note: don't touch anything under camera!!! EVER!!! */
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {!startCamera &&
          !previewVisible &&
          !photoChosen &&
          !historyPageReq &&
          !NewMealRequest &&
          !FromDataOption && (
            <View>
              <Header />
              <Btn
                icon={<Icon name="plus" size={15} color="#f01f72" />}
                buttonStyle={buttonStyles.button}
                containerStyle={buttonStyles.container}
                title="Add a new meal"
                color="#d13876"
                onPress={newMeal}
              />
              <Btn
                icon={<Icon name="info" size={15} color="#f01f72" />}
                buttonStyle={buttonStyles.button}
                containerStyle={buttonStyles.container}
                title="Meal History View"
                color="#d13876"
                onPress={historyPage}
              />
            </View>
          )}
        {NewMealRequest && !foodCurrentlyWeighted && !doneWeighting && (
          <View>
            <Text style={PictureSuccessfulDesign}>
              The picture was saved successfully!
            </Text>
            <Text style={WeightRequestDesign}>Now please weigh your food</Text>
            <Btn
              icon={<Icon name="forward" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="I'm ready to weigh"
              color="#d13876"
              onPress={getWeight}
            />
            <Btn
              icon={<Icon name="home" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Back home"
              color="#d13876"
              onPress={BackHome}
            />
          </View>
        )}
        {foodCurrentlyWeighted && (
          <View style={ImageDesign}>
            <Text style={WeighWaitDesign1}>Please Wait</Text>
            <Image
              source={require("./assets/PinkClock.png")}
              style={{ width: 200, height: 200 }}
            />
            <Text style={WeighWaitDesign2}>now weighing your food...</Text>
          </View>
        )}
        {doneWeighting &&
          savedWeight &&
          !startCamera &&
          !savedPhoto &&
          !FromDataOption && (
            <View>
              <Text style={WeightReadyDesign}>
                Your meal weight:{"\n"} {weight}
              </Text>
              <Text style={WeighIsReadyDesign}>
                Please Decide how to precceed:
              </Text>
              <Btn
                icon={<Icon name="camera" size={15} color="#f01f72" />}
                buttonStyle={buttonStyles.button}
                containerStyle={buttonStyles.container}
                title="Take a picture"
                color="#d13876"
                onPress={requestPermission}
              />
              <Btn
                icon={<Icon name="cloud" size={15} color="#f01f72" />}
                buttonStyle={buttonStyles.button}
                containerStyle={buttonStyles.container}
                title="Use existing data"
                color="#d13876"
                onPress={chooseFromData}
              />
            </View>
          )}
        {historyPageReq && (
          <View>
            <Btn
              icon={<Icon name="home" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Back home"
              color="#d13876"
              onPress={BackHome}
            />
          </View>
        )}
        {previewVisible && (
          <View>
            <CameraPreview photo={savedPhoto} />
            <Btn
              icon={<Icon name="camera" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Take another one"
              color="#d13876"
              onPress={clearPhoto}
            />
            <Btn
              icon={<Icon name="download" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Use this photo"
              color="#d13876"
              onPress={usePhoto}
            />
          </View>
        )}
        {startCamera && (
          <Camera
            style={{ flex: 1, width: "100%" }}
            ref={(r) => {
              camera = r;
            }}
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                backgroundColor: "transparent",
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  flexDirection: "row",
                  flex: 1,
                  width: "100%",
                  padding: 20,
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    alignSelf: "center",
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={takePicture}
                    style={{
                      width: 70,
                      height: 70,
                      bottom: 0,
                      borderRadius: 50,
                      backgroundColor: "#fff",
                    }}
                  />
                </View>
              </View>
            </View>
          </Camera>
        )}
        {WaitForOptions && (
          <View style={ImageDesign}>
            <Text style={WeighWaitDesign1}>Please Wait</Text>
            <Image
              source={require("./assets/PinkClock.png")}
              style={{ width: 200, height: 200 }}
            />
            <Text style={WeighWaitDesign2}>
              now extracting data from picture..
            </Text>
          </View>
        )}
        {ReceievedOptionsFromBack && !WaitForOptions && (
          <ButtonGroup
            buttons={[
              Option1FromPhotoAnalysis,
              Option2FromPhotoAnalysis,
              Option3FromPhotoAnalysis,
              Option4FromPhotoAnalysis,
              "Other",
            ]}
          />
        )}
        {FromDataOption && (
          <Btn
            icon={<Icon name="home" size={15} color="#f01f72" />}
            buttonStyle={buttonStyles.button}
            containerStyle={buttonStyles.container}
            title="Back home"
            color="#d13876"
            onPress={BackHome}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

//*****************************************************************************
//*********************************Styles:*************************************
//*****************************************************************************

//These are all the designs of each view property
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

const ImageDesign = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
};

const WeightRequestDesign = {
  color: "#ed1c93",
  textAlign: "center",
  fontSize: 35,
  fontWeight: 700,
};

const PictureSuccessfulDesign = {
  color: "#bd0970",
  textAlign: "center",
  fontSize: 20,
  fontWeight: 500,
};

const WeighWaitDesign1 = {
  color: "#e66abc",
  textAlign: "center",
  fontSize: 40,
  fontWeight: 800,
};

const WeighWaitDesign2 = {
  color: "#e66abc",
  textAlign: "center",
  fontSize: 25,
  fontWeight: 700,
};

const WeightReadyDesign = {
  color: "#fa4886",
  textAlign: "center",
  fontSize: 40,
  fontWeight: 700,
};

const WeighIsReadyDesign = {
  color: "#e05c98",
  fontSize: 18,
  textAlign: "center",
};

const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: "pink",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  container: {
    width: 200,
    marginHorizontal: 50,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "black",
  },
});
