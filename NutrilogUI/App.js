import { useState } from 'react'
import { Alert, Button, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Header from './src/header';
import { Camera } from 'expo-camera';
import CameraPreview from './src/CameraPreview'

export default function App() {
  const [startCamera, setStartCamera] = useState(false) //Bollean - sets the permission to start taking a picture
  const [previewVisible, setPreviewVisible] = useState(false) //Bollean - after taking a picture the picture is availble for preview
  const [photoChosen, setPhotoChosen] = useState(false) //Bollean - after preview the user chose this photo to be further used
  const [foodWeighted, setFoodWeighted] = useState(false)
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
    const photo = await camera.takePictureAsync()
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
  //THIS FUNCTION WILL DELIVER THE PHOTO TO ETI!
  //probably will be Async :)
  const usePhoto = () => {
    setPhotoChosen(true)
    setPreviewVisible(false)
  }

  const getWeight = () => {
    setFoodWeighted(true)
  }


//*****************************************************************************
//*********************************View:***************************************
//*****************************************************************************


  //These are the view properties. each wil be either shown or not with conditions:
  //Those are set by the bollean startCamera and previewVisible
  //**note: don't touch anything under camera!!! EVER!!! */
  return (
    <View style={styles.container}>
      {!startCamera && !previewVisible && !photoChosen && (
        <View>
          <Header />
          <Button
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
      {photoChosen && (
        <View>
          <Text>Please Weight your food</Text>
          <Button> onPress={getWeight} title ="I'm ready to weight! </Button>
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
