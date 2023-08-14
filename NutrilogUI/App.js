import { useState } from "react";
import {
  Alert,
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
import {
  Button as Btn,
  ButtonGroup,
  Input,
  LinearProgress,
  ActivityIndicator,
} from "react-native-elements";
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
  const [WaitForOptions, setWaitForOptions] = useState(false); //Waiting to server to retreive options from db
  const [ReceivedOptionsFromBack, setReceivedOptionsFromBack] = useState(false); //After Recieving Options
  const [Option1FromPhotoAnalysis, setOption1FromPhotoAnalysis] =
    useState("Option1"); // each option -1
  const [Option2FromPhotoAnalysis, setOption2FromPhotoAnalysis] =
    useState("Option2"); // each option -2
  const [Option3FromPhotoAnalysis, setOption3FromPhotoAnalysis] =
    useState("Option3"); // each option -3
  const [Option4FromPhotoAnalysis, setOption4FromPhotoAnalysis] =
    useState("Option4"); // each option -4
  const [selectedIndex, setSelectedIndex] = useState(-1); // pressed button out of 4 options + other -> button index
  const [fillMealFormSelected, setfillMealFormSelected] = useState(false); // if fifth button is pressed (other) - need to add manually the meal
  const [inputValues, setinputValues] = useState({
    name: "",
    calories: "",
    fat_total_g: "",
    fat_saturated_g: "",
    protein_g: "",
    sodium_mg: "",
    potassium_mg: "",
    cholesterol_mg: "",
    carbohydrates_total_g: "",
    fiber_g: "",
    sugar_g: "",
  });
  const iconsPerField = [
    "tag",
    "calculator",
    "dashboard",
    "dashboard",
    "dashboard",
    "dashboard",
    "dashboard",
    "dashboard",
    "dashboard",
    "dashboard",
    "dashboard",
  ]; // Define an array of icon names
  const [mealNutritionValues, setmealNutritionValues] = useState({
    name: "Potato and lamb",
    calories: "",
    fat_total_g: "",
    fat_saturated_g: "",
    protein_g: "",
    sodium_mg: "",
    potassium_mg: "",
    cholesterol_mg: "",
    carbohydrates_total_g: "",
    fiber_g: "",
    sugar_g: "",
  });
  const [historyFromServer, setHistoryFromServer] = useState([
    {
      name: "Rice with beans",
      calories: "",
      fat_total_g: "",
      fat_saturated_g: "",
      protein_g: "10",
      sodium_mg: "",
      potassium_mg: "",
      cholesterol_mg: "",
      carbohydrates_total_g: "",
      fiber_g: "",
      sugar_g: "",
      timestamp: "2023-08-13T18:54:46.753Z",
    },
    {
      name: "Turkey sandwitch",
      calories: "",
      fat_total_g: "",
      fat_saturated_g: "",
      protein_g: "30",
      sodium_mg: "",
      potassium_mg: "",
      cholesterol_mg: "",
      carbohydrates_total_g: "",
      fiber_g: "",
      sugar_g: "",
      timestamp: "2023-08-12T18:54:46.753Z",
    },
    {
      name: "Pasta carbonara",
      calories: "",
      fat_total_g: "",
      fat_saturated_g: "",
      protein_g: "22",
      sodium_mg: "",
      potassium_mg: "",
      cholesterol_mg: "",
      carbohydrates_total_g: "",
      fiber_g: "",
      sugar_g: "",
      timestamp: "2023-08-10T18:54:46.753Z",
    },
    {
      name: "Burger and fries",
      calories: "",
      fat_total_g: "",
      fat_saturated_g: "",
      protein_g: "8",
      sodium_mg: "",
      potassium_mg: "",
      cholesterol_mg: "",
      carbohydrates_total_g: "",
      fiber_g: "",
      sugar_g: "",
      timestamp: "2023-08-09T18:54:46.753Z",
    },
    {
      name: "Yougurt with granola",
      calories: "",
      fat_total_g: "",
      fat_saturated_g: "",
      protein_g: "14",
      sodium_mg: "",
      potassium_mg: "",
      cholesterol_mg: "",
      carbohydrates_total_g: "",
      fiber_g: "",
      sugar_g: "",
      timestamp: "2023-08-09T12:54:46.753Z",
    },
  ]);
  const [summaryIsReady, setsummaryIsReady] = useState(false);
  const [searchInDB, setsearchInDB] = useState(false);
  const [inputForSearchInDB, setinputForSearchInDB] = useState("");
  const [HistoryMealIndex, setHistoryMealIndex] = useState(-1);
  let camera;
  const IPAddress = "192.168.1.183";

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
    setsearchInDB(false);
  };

  const searchInDBPage = () => {
    setsearchInDB(true);
  };

  //This is triggerd within the camera component inside the view
  const takePicture = async () => {
    if (!camera) return;
    const options = { quality: 0.01 };
    const photo = await camera.takePictureAsync(options);
    setSavedPhoto(photo);
    setPreviewVisible(true);
    setStartCamera(false);
  };

  //This is triggered within the clear picture button
  const clearPhoto = () => {
    setSavedPhoto(null);
    setPreviewVisible(false);
    setFromDataOption(false);
  };

  const SearchMealInDB = () => {
    //Eti will now send inputForSearchInDB to back and look for it --complete
    sendNewItem(inputForSearchInDB);
    console.log("now looks for", inputForSearchInDB);
    setsearchInDB(false);
    setsummaryIsReady(true);
    setFromDataOption(false);
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
      photoData.append("photo", {
        uri: savedPhoto.uri,
        name: "photo.jpg",
        type: "image/jpg",
      });
      const response = await axios.post(
        "http://" + IPAddress + ":3000/api/upload",
        photoData
      );
      console.log("Photo uploaded successfully:", response.data);
      pollForResult();
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  async function pollForResult() {
    await axios
      .get("http://" + IPAddress + ":3000/api/get-results")
      .then((response) => {
        const data = response.data;
        if (data.status === "success") {
          // Process the received result from the server
          console.log("received data");
          const data_json = JSON.parse(data.data);
          const topResults = data_json.results;
          console.log(topResults);

          // Assuming these lines are related to handling the received data
          setOption1FromPhotoAnalysis(topResults[0].name);
          setOption2FromPhotoAnalysis(topResults[1].name);
          setOption3FromPhotoAnalysis(topResults[2].name);
          setOption4FromPhotoAnalysis(topResults[3].name);
          setReceivedOptionsFromBack(true);
          setWaitForOptions(false);
        } else if (data.status === "processing") {
          console.log("still processing");
          // If still processing, continue polling
          setTimeout(pollForResult, 1000); // Poll every 1 second
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  //This function us triggered by "weigh now" button
  //It sends a request to weigh to the back end and gets the result and displays it
  const getWeight = async () => {
    setFoodCurrentlyWeighted(true);
    try {
      answer = await axios.get("http://" + IPAddress + ":3000/api/start-weigh");
      weight = answer.data.weigh_val;
    } catch (e) {
      console.log(e);
      Alert.alert("couldn't connect to server");
      BackHome();
    }
    setFoodCurrentlyWeighted(false);
    setDoneWeighting(true);
    // setSavedWeight(answer); --complete
    setSavedWeight(weight);
  };

  const sendChosenIndex = async (index) => {
    console.log("hi", index);
    if (index === 4) {
      chooseFromData();
    } else {
      //Send to server the index of the user's option
      try {
        const indexData = { option_index: index };
        const response = await axios.post(
          "http://" + IPAddress + ":3000/api/get-option-index",
          indexData
        );
        console.log("call to  getNutritionValuesFromServer func");
        getNutritionValuesFromServer();
        //showSummary();
      } catch (error) {
        console.error("Error getting nutrition_values", error);
      }
    }
  };

  async function getNutritionValuesFromServer() {
    await axios
      .get("http://" + IPAddress + ":3000/api/get-NutritionValues")
      .then((response) => {
        const data = response.data;
        if (data.status === "success") {
          // Process the received result from the server
          console.log("received data");
          const data_json = JSON.parse(data.data);
          const nutrition_values = data_json.nutrition_values;
          console.log(typeof nutrition_values);
          if (nutrition_values == "not found") {
            console.log("not found item");
            Alert.alert("Your option could not be found in DB");
            BackHome();
            //func not found- go to fill form
          } else {
            const updatedValues = { ...mealNutritionValues };
            if (nutrition_values.length > 0) {
              const firstItem = nutrition_values[0];
              for (const key in firstItem) {
                if (updatedValues.hasOwnProperty(key)) {
                  updatedValues[key] = String(firstItem[key]);
                }
              }
            }
            setmealNutritionValues(updatedValues);
            //send to summery
            console.log("updated:", updatedValues);
            showSummary();
          }
        } else if (data.status === "processing") {
          console.log("still processing");
          // If still processing, continue polling
          setTimeout(getNutritionValuesFromServer, 1000); // Poll every 1 second
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  //This function needs to be active when the user wants
  //to check the nutritional values of other food from the top 4 options
  //input item is a string with the food's name
  async function sendNewItem(item) {
    try {
      const data = { food_name: item };
      const response = await axios.post(
        "http://" + IPAddress + ":3000/api/get-new-item",
        data
      );
      console.log("call to getNutritionValuesFromServer func");
      getNutritionValuesFromServer();
    } catch (error) {
      console.error("Error getting nutrition_values of the new option", error);
    }
  }

  const fillMealForm = () => {
    setfillMealFormSelected(true);
    setReceivedOptionsFromBack(false);
    setFromDataOption(false);
  };

  const handleInputChange = (inputName, value) => {
    if (inputName != "name") {
      if (/^\d+$/.test(value)) {
        setinputValues((prevValues) => ({ ...prevValues, [inputName]: value }));
      } else {
        Alert.alert("Must be an Integer!");
      }
    }
    setinputValues((prevValues) => ({ ...prevValues, [inputName]: value }));
  };

  const handleSubmit = () => {
    //Send the values to the server
    sendMealValues(inputValues);
    console.log("Input Values:", inputValues);
    const factor = parseFloat(savedWeight) / 100; // Calculate the factor based on the given weight
    console.log(factor);

    const modifiedValues = {};
    for (const key in inputValues) {
      if (inputValues.hasOwnProperty(key) && key != "name") {
        modifiedValues[key] = (parseFloat(inputValues[key]) * factor)
          .toFixed(1)
          .toString();
      }
      if (key == "name") {
        modifiedValues[key] = inputValues[key];
      }
    }
    setmealNutritionValues({ ...mealNutritionValues, ...modifiedValues });
    showSummary();
  };

  const sendMealValues = async (input) => {
    console.log("input: ", input);
    try {
      const data = { meal_values: input };
      const response = await axios.post(
        "http://" + IPAddress + ":3000/api/get-meal-values",
        data
      );
      console.log("Sent the mea values to the server ");
    } catch (error) {
      console.error("Error sending the meal values to the server", error);
    }
  };

  const showSummary = () => {
    setsummaryIsReady(true);
  };

  showHistoryMealSummary = (value) => {
    setHistoryMealIndex(value);
  };

  const BackHome = () => {
    setStartCamera(false);
    setPreviewVisible(false);
    setPhotoChosen(false);
    setFoodCurrentlyWeighted(false);
    setDoneWeighting(false);
    setSavedWeight(null);
    setSavedPhoto(null);
    setHistoryReq(false);
    setNewMealRequest(false);
    setFromDataOption(false);
    setWaitForOptions(false);
    setReceivedOptionsFromBack(false);
    setOption1FromPhotoAnalysis("Option1");
    setOption2FromPhotoAnalysis("Option2");
    setOption3FromPhotoAnalysis("Option3");
    setOption4FromPhotoAnalysis("Option4");
    setSelectedIndex(-1);
    setfillMealFormSelected(false);
    setinputValues({
      name: "",
      calories: "",
      fat_total_g: "",
      fat_saturated_g: "",
      protein_g: "",
      sodium_mg: "",
      potassium_mg: "",
      cholesterol_mg: "",
      carbohydrates_total_g: "",
      fiber_g: "",
      sugar_g: "",
    });
    setmealNutritionValues({
      name: "",
      calories: "",
      fat_total_g: "",
      fat_saturated_g: "",
      protein_g: "",
      sodium_mg: "",
      potassium_mg: "",
      cholesterol_mg: "",
      carbohydrates_total_g: "",
      fiber_g: "",
      sugar_g: "",
    });
    setHistoryFromServer([
      {
        name: "Rice with beans",
        calories: "",
        fat_total_g: "",
        fat_saturated_g: "",
        protein_g: "10",
        sodium_mg: "",
        potassium_mg: "",
        cholesterol_mg: "",
        carbohydrates_total_g: "",
        fiber_g: "",
        sugar_g: "",
        timestamp: "2023-08-13T18:54:46.753Z",
      },
      {
        name: "Turkey sandwitch",
        calories: "",
        fat_total_g: "",
        fat_saturated_g: "",
        protein_g: "30",
        sodium_mg: "",
        potassium_mg: "",
        cholesterol_mg: "",
        carbohydrates_total_g: "",
        fiber_g: "",
        sugar_g: "",
        timestamp: "2023-08-12T18:54:46.753Z",
      },
      {
        name: "Pasta carbonara",
        calories: "",
        fat_total_g: "",
        fat_saturated_g: "",
        protein_g: "22",
        sodium_mg: "",
        potassium_mg: "",
        cholesterol_mg: "",
        carbohydrates_total_g: "",
        fiber_g: "",
        sugar_g: "",
        timestamp: "2023-08-10T18:54:46.753Z",
      },
      {
        name: "Burger and fries",
        calories: "",
        fat_total_g: "",
        fat_saturated_g: "",
        protein_g: "8",
        sodium_mg: "",
        potassium_mg: "",
        cholesterol_mg: "",
        carbohydrates_total_g: "",
        fiber_g: "",
        sugar_g: "",
        timestamp: "2023-08-09T18:54:46.753Z",
      },
      {
        name: "Yougurt with granola",
        calories: "",
        fat_total_g: "",
        fat_saturated_g: "",
        protein_g: "14",
        sodium_mg: "",
        potassium_mg: "",
        cholesterol_mg: "",
        carbohydrates_total_g: "",
        fiber_g: "",
        sugar_g: "",
        timestamp: "2023-08-09T12:54:46.753Z",
      },
    ]);
    setsummaryIsReady(false);
    sendResetToServer();
    setsearchInDB(false);
    setinputForSearchInDB("");
    setHistoryMealIndex(-1);
  };

  async function sendResetToServer() {
    const response = await axios.get(
      "http://" + IPAddress + ":3000/api/reset-values"
    );
    console.log("send reset to server");
  }

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
          !FromDataOption &&
          !summaryIsReady &&
          !ReceivedOptionsFromBack && (
            <View style={GeneralViewStyle}>
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
          <View style={styles.container}>
            <Text style={WeightRequestDesign}>Please weigh your food</Text>
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
          !FromDataOption &&
          !summaryIsReady &&
          !fillMealFormSelected && (
            <View style={styles.container}>
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
        {historyPageReq && HistoryMealIndex == -1 && (
          <View style={GeneralViewStyle}>
            <Text style={HistoryPageDesign1}>Meals History:</Text>
            <ButtonGroup
              buttons={historyFromServer.map((item) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Icon name="calendar" />
                  <Text
                    style={HistorybuttonGroupStyles.textName}
                  >{` ${item.name} :`}</Text>
                  <Text style={HistorybuttonGroupStyles.textTime}>{` ${new Date(
                    item.timestamp
                  ).toLocaleString()}`}</Text>
                </View>
              ))}
              selectedIndex={selectedIndex}
              onPress={(value) => {
                showHistoryMealSummary(value);
              }}
              containerStyle={HistorybuttonGroupStyles.container}
              buttonStyle={HistorybuttonGroupStyles.button}
              selectedButtonStyle={HistorybuttonGroupStyles.buttonPressed}
              vertical={true}
              innerBorderStyle={{ width: 0 }}
            />
            <Text style={HistoryPageDesign2}>
              In the past{" "}
              {Math.floor(
                (new Date().getTime() -
                  new Date(historyFromServer[4].timestamp).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days, you've consumed on average{"\n"}{" "}
              {(
                ((Number(historyFromServer[0].protein_g) +
                  Number(historyFromServer[1].protein_g) +
                  Number(historyFromServer[2].protein_g) +
                  Number(historyFromServer[3].protein_g) +
                  Number(historyFromServer[4].protein_g)) /
                  (5 * 40)) *
                100
              ).toFixed(1)}
              % of your daily protein intake.
              {"\n"}(Which is 40 grams)
            </Text>
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
          <View style={styles.container}>
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
        {ReceivedOptionsFromBack &&
          !WaitForOptions &&
          !summaryIsReady &&
          !FromDataOption && (
            <View>
              <Text style={SelectOptionsDesign1}>
                Please select an option that matches best.
              </Text>
              <Text style={SelectOptionsDesign2}>
                If none of the options satisfies, please press other.
              </Text>
              <ButtonGroup
                buttons={[
                  Option1FromPhotoAnalysis,
                  Option2FromPhotoAnalysis,
                  Option3FromPhotoAnalysis,
                  Option4FromPhotoAnalysis,
                  "Other",
                ]}
                selectedIndex={selectedIndex}
                onPress={(value) => {
                  setSelectedIndex(value);
                  sendChosenIndex(value);
                }}
                containerStyle={buttonGroupStyles.container}
                buttonStyle={buttonGroupStyles.button}
                selectedButtonStyle={buttonGroupStyles.buttonPressed}
                textStyle={buttonGroupStyles.text}
                vertical={true}
                innerBorderStyle={{ width: 0 }}
              />
            </View>
          )}
        {FromDataOption && !searchInDB && (
          <View style={GeneralViewStyle}>
            <Text style={FromDataOptionDesign}>
              Please choose how to retreive data:
            </Text>
            <Btn
              icon={<Icon name="search" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Search in DB"
              color="#d13876"
              onPress={searchInDBPage}
            />
            <Btn
              icon={<Icon name="file" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Fill manually"
              color="#d13876"
              onPress={fillMealForm}
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
        {searchInDB && (
          <View style={GeneralViewStyle}>
            <Text style={FromDataOptionDesign}>
              Please look up your meal name:
            </Text>
            <Input
              placeholder={"Enter a meal name to look for"}
              value={inputForSearchInDB}
              onChangeText={setinputForSearchInDB}
              containerStyle={stylesForSheetFill.container}
              inputContainerStyle={{ width: "100%", borderBottomWidth: 0 }}
              leftIcon={{
                type: "font-awesome",
                name: "search",
                size: 15,
                color: "pink",
              }}
            />
            <Btn
              icon={<Icon name="database" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Search"
              color="#d13876"
              onPress={SearchMealInDB}
            />
            <Btn
              icon={<Icon name="rotate-right" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Back"
              color="#d13876"
              onPress={chooseFromData}
            />
          </View>
        )}
        {fillMealFormSelected && !summaryIsReady && (
          <View style={GeneralViewStyle}>
            <Text style={FormFillingDesign1}>New Meal:</Text>
            <Text style={FormFillingDesign2}>
              Please fill the fields per 100g. {"\n"}
              Make sure it sums to this size and that{"\n"}
              each field is in the right measurment unit.
            </Text>
            {Object.keys(inputValues).map((inputName, index) => (
              <Input
                key={inputName}
                placeholder={
                  "Enter " +
                  inputName.charAt(0).toUpperCase() +
                  inputName.slice(1)
                }
                value={inputValues[inputName]}
                onChangeText={(value) => handleInputChange(inputName, value)}
                containerStyle={stylesForSheetFill.container}
                inputContainerStyle={{ width: "100%", borderBottomWidth: 0 }}
                leftIcon={{
                  type: "font-awesome",
                  name: iconsPerField[index],
                  size: 15,
                  color: "pink",
                }}
              />
            ))}
            <Btn
              icon={<Icon name="save" size={15} color="#f01f72" />}
              buttonStyle={buttonStyles.button}
              containerStyle={buttonStyles.container}
              title="Submit"
              color="#d13876"
              onPress={handleSubmit}
            />
          </View>
        )}
        {summaryIsReady && (
          <View style={GeneralViewStyle}>
            <Text style={MealSummaryPageDesign1}>Meal Summary: {"\n"}</Text>
            {Object.keys(mealNutritionValues).map((key) => (
              <View key={key} style={SummaryStyles.row}>
                <View style={{ width: "70%" }}>
                  <Text style={SummaryStyles.label} numberOfLines={1}>
                    {key}:
                  </Text>
                </View>
                <Text style={SummaryStyles.value}>
                  {mealNutritionValues[key]}
                </Text>
              </View>
            ))}
            <Text style={MealSummaryPageDesign2}>
              {"\n"}This meal comprises{" "}
              {((mealNutritionValues["protein_g"] / 40) * 100).toFixed(1)}% of
              your daily allowance of protein, {"\n"}
              which evaluates 40 grams.
            </Text>
            <LinearProgress
              style={{ marginVertical: 10, width: 300, height: 20 }}
              color="#fa4886"
              value={mealNutritionValues["protein_g"] / 40}
              variant="determinate"
              animation={true}
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
        {HistoryMealIndex != -1 && (
          <View style={GeneralViewStyle}>
            <Text style={MealSummaryPageDesign1}>Meal Summary:</Text>
            <Text style={MealSummaryPageDesign2}>
              From{" "}
              {new Date(
                historyFromServer[HistoryMealIndex].timestamp
              ).toLocaleString()}{" "}
              {"\n"}
            </Text>
            {Object.keys(historyFromServer[HistoryMealIndex]).map(
              (key) =>
                key !== "timestamp" && (
                  <View key={key} style={SummaryStyles.row}>
                    <View style={{ width: "70%" }}>
                      <Text style={SummaryStyles.label} numberOfLines={1}>
                        {key}:
                      </Text>
                    </View>
                    <Text style={SummaryStyles.value}>
                      {historyFromServer[HistoryMealIndex][key]}
                    </Text>
                  </View>
                )
            )}
            <Text style={MealSummaryPageDesign2}>
              {"\n"}This meal comprises{" "}
              {(
                (historyFromServer[HistoryMealIndex]["protein_g"] / 40) *
                100
              ).toFixed(1)}
              % of your daily allowance of protein, {"\n"}
              which evaluates 40 grams.
            </Text>
            <LinearProgress
              style={{ marginVertical: 10, width: 300, height: 20 }}
              color="#fa4886"
              value={historyFromServer[HistoryMealIndex]["protein_g"] / 40}
              variant="determinate"
              animation={true}
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

const SelectOptionsDesign1 = {
  color: "#e06ca2",
  textAlign: "center",
  fontSize: 22,
  fontWeight: 800,
};

const SelectOptionsDesign2 = {
  color: "#ed1c93",
  textAlign: "center",
  fontSize: 15,
  fontWeight: 700,
};

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

const FormFillingDesign1 = {
  color: "#fa4886",
  textAlign: "center",
  fontSize: 40,
  fontWeight: 700,
};

const FormFillingDesign2 = {
  color: "#fa4886",
  textAlign: "center",
  fontSize: 15,
  fontWeight: 700,
};

const HistoryPageDesign1 = {
  color: "#e06ca2",
  textAlign: "center",
  fontSize: 50,
  fontWeight: 900,
};

const HistoryPageDesign2 = {
  color: "#e06ca2",
  textAlign: "center",
  fontSize: 17,
  fontWeight: 500,
};

const MealSummaryPageDesign1 = {
  color: "#fa4886",
  textAlign: "center",
  fontSize: 40,
  fontWeight: 700,
};

const MealSummaryPageDesign2 = {
  color: "#fa4886",
  textAlign: "center",
  fontSize: 15,
  fontWeight: 700,
};

const FromDataOptionDesign = {
  color: "#f01f72",
  textAlign: "center",
  fontSize: 20,
  fontWeight: 900,
};

const GeneralViewStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const SummaryStyles = {
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 2,
    borderBottomWidth: 1.5,
    borderColor: "pink",
    alignItems: "center",
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fa4886",
    flex: 2,
    width: "100%",
  },
  value: {
    flex: 2,
    fontSize: 18,
  },
};
const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: "pink",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    marginRight: 0,
  },
  container: {
    width: 200,
    marginVertical: 10,
    alignContent: "center",
    alignItems: "flex-start",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "black",
  },
});

const buttonGroupStyles = StyleSheet.create({
  button: {
    backgroundColor: "#f5dfe9",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e06ca2",
    marginVertical: 5,
    overlayColor: "black",
  },
  container: {
    marginHorizontal: 30,
    marginVertical: 20,
    alignItems: "stretch",
    justifyContent: "center",
    height: "50%",
    flexDirection: "column",
    borderWidth: 0,
    borderColor: "transparent",
  },
  text: {
    fontSize: 17,
    lineHeight: 35,
    letterSpacing: 0.25,
    color: "black",
  },
  buttonPressed: {
    backgroundColor: "#e85197",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e06ca2",
    marginVertical: 5,
    overlayColor: "black",
  },
});

const HistorybuttonGroupStyles = StyleSheet.create({
  button: {
    backgroundColor: "#faf5f7",
    alignItems: "center",
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e06ca2",
    marginVertical: 5,
    padding: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-start",
  },
  container: {
    marginHorizontal: 40,
    marginVertical: 20,
    alignItems: "stretch",
    justifyContent: "center",
    height: "50%",
    flexDirection: "column",
    borderWidth: 0,
    borderColor: "transparent",
    width: "90%",
  },
  textTime: {
    fontSize: 15,
    lineHeight: 35,
    letterSpacing: 0.25,
    color: "black",
    fontWeight: 200,
  },
  textName: {
    fontSize: 15,
    lineHeight: 35,
    letterSpacing: 0.25,
    color: "black",
    fontWeight: 600,
  },
  buttonPressed: {
    backgroundColor: "#e85197",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e06ca2",
    marginVertical: 5,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-start",
  },
});

const stylesForSheetFill = StyleSheet.create({
  container: {
    height: 40,
    borderColor: "pink",
    borderWidth: 1,
    marginBottom: 10,
    // paddingHorizontal: 150,
    width: "62%",
    fontSize: 15,
  },
  text: {
    fontSize: 17,
    lineHeight: 35,
    letterSpacing: 0.25,
    paddingHorizontal: 40,
    color: "black",
  },
});
