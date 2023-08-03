import { useState } from 'react'
import { Alert, Button, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import Header from './src/header';
import { Camera } from 'expo-camera';
import CameraPreview from './src/CameraPreview'
import axios from 'axios';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button as Btn, Badge } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function App() {
  const [startCamera, setStartCamera] = useState(false) //Bollean - sets the permission to start taking a picture
  const [previewVisible, setPreviewVisible] = useState(false) //Bollean - after taking a picture the picture is availble for preview
  const [photoChosen, setPhotoChosen] = useState(false) //Bollean - after preview the user chose this photo to be further used
  const [foodCurrentlyWeighted, setFoodCurrentlyWeighted] = useState(false) //Bolean - user starts weigh and we're waiting for server's answer
  const [doneWeighting, setDoneWeighting] = useState(false) //Bolean - got an answer from the server about weight and can show it
  const [savedWeight, setSavedWeight] = useState(null) //String - has the weight value in it
  const [savedPhoto, setSavedPhoto] = useState(null) //Png- saves the picture the user took
  let camera

  //*****************************************************************************
  //*******************************Functions:************************************
  //*****************************************************************************

  //This function is triggred when pressing "Add a meal"
  //If premission is allowed will further let us take a photo with setting startCamera as True
  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()

    if (status === 'granted') {
      setStartCamera(true)
    } else {
      Alert.alert('Access Denied!')
    }
  }

  //This is triggerd within the camera component inside the view 
  const takePicture = async () => {
    if (!camera) return
    const photo = await camera.takePictureAsync();
    setSavedPhoto(photo)
    setPreviewVisible(true)
    setStartCamera(false)
  }

  //This is triggered within the clear picture button
  const clearPhoto = () => {
    setSavedPhoto(null)
    setPreviewVisible(false)
  }

  //This is triggres within the keep picture button
  //THIS FUNCTION WILL DELIVER THE PHOTO TO BACK
  const usePhoto = async() => {
    setPhotoChosen(true)
    setPreviewVisible(false)

    const responseF = await fetch(savedPhoto.uri) ;
    const blob = await responseF.blob();
    const formData = new FormData();
    formData.append('photo', blob, 'photo.jpg')
    const axProperties = {
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    // try{
    //   await axios.post('http://192.168.1.35:3000/api/upload-photo',axProperties);
    // }
    // catch (e){
    //   console.log(e)
    // }

  }

  //This function us triggered by "weigh now" button
  //It sends a request to weigh to the back end and gets the result and displays it
  const getWeight = async() => {
    setFoodCurrentlyWeighted(true)
    try{
      answer = await axios.get('http://192.168.1.35:3000/api/start-weigh');
      weight = answer.data.weigh_val
    }
    catch (e){
      console.log(e)
      Alert.alert("couldn't connect to server")
      BackHome()
    }
    setFoodCurrentlyWeighted(false)
    setDoneWeighting(true)
    setSavedWeight(answer)
  }

  const BackHome = () => {
    setPhotoChosen(false)
    setDoneWeighting(false)
    setSavedWeight(null)
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
        {!startCamera && !previewVisible && !photoChosen && (
          <View>
            <Header />
            <Btn
              style={buttonStyles.button}
              title="Add a meal"
              color="#d13876"
              onPress={requestPermission}
            /> 
          </View>
        )}     
        {previewVisible && (
          <View>
            <CameraPreview photo={savedPhoto} />
            <Button onPress={clearPhoto} title="Clear Photo" />
            <Button onPress={usePhoto} title="Use Photo" />
          </View>
        )}
        {photoChosen && !foodCurrentlyWeighted && !doneWeighting && (
          <View>
            <Text style={PictureSuccessfulDesign}>The picture was saved successfully!</Text>
            <Text style={WeightRequestDesign}>Now please weigh your food</Text>
            <Button onPress={getWeight} title ="I'm ready to weigh!" />
          </View>

        )}
        {foodCurrentlyWeighted && (
          <View style={ImageDesign}>
            <Text style={WeighWaitDesign1}>Please Wait</Text>
            <Image source={require('./assets/PinkClock.png')} 
            style={{width:200,height:200}}/>
            <Text style={WeighWaitDesign2}>now weighing your food...</Text>
          </View>
        )}
        {doneWeighting && savedWeight &&  (
          <View>
            <Text style={WeightReadyDesign}>Your meal weight:{"\n"} {weight}</Text>
            <Text style={BackHomeDesign}>In a few seconds, your meal data will be ready...</Text>
            <Button onPress={BackHome} title ="Back to home screen" />
          </View>

        )}
        {startCamera && (
          <Camera
            style={{flex: 1,width:"100%"}}
            ref={(r) => {
              camera = r
            }}
          >
            <View
              style={{
                flex: 1,
                width: '100%',
                backgroundColor: 'transparent',
                flexDirection: 'row'
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  flexDirection: 'row',
                  flex: 1,
                  width: '100%',
                  padding: 20,
                  justifyContent: 'space-between'
                }}
              >
                <View
                  style={{
                    alignSelf: 'center',
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <TouchableOpacity
                    onPress={takePicture}
                    style={{
                      width: 70,
                      height: 70,
                      bottom: 0,
                      borderRadius: 50,
                      backgroundColor: '#fff'
                    }}
                  />
                </View>
              </View>
            </View>
          </Camera>)}
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const ImageDesign = {
  flex:1,
  justifyContent: 'center',
  alignItems:'center',
}

const WeightRequestDesign = {
  color: '#ed1c93',
  textAlign: 'center',
  fontSize: 35,
  fontWeight: 700
}

const PictureSuccessfulDesign = {
  color: '#bd0970',
  textAlign: 'center',
  fontSize: 20,
  fontWeight: 500
}

const WeighWaitDesign1 = {
  color: '#e66abc',
  textAlign: 'center',
  fontSize: 40,
  fontWeight: 800
}

const WeighWaitDesign2 = {
  color: '#e66abc',
  textAlign: 'center',
  fontSize: 25,
  fontWeight: 700
}

const WeightReadyDesign = {
  color: '#a83481',
  textAlign: 'center',
  fontSize: 40,
  fontWeight: 700,
}

const BackHomeDesign = {
  color: '#801c5e',
  fontSize: 18
}

const buttonStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#dea9be',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'black',
  },
});
