import { useState } from 'react'
import { Alert, Button, StyleSheet, TouchableOpacity, View } from 'react-native';
import Header from './src/header';
import { Camera } from 'expo-camera';
import CameraPreview from './src/CameraPreview'

export default function App() {
  const [startCamera, setStartCamera] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [savedPhoto, setSavedPhoto] = useState(null)
  let camera

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()

    if (status === 'granted') {
      setStartCamera(true)
    } else {
      Alert.alert('Access Denied!')
    }
  }

  const takePicture = async () => {
    if (!camera) return
    const photo = await camera.takePictureAsync()
    setSavedPhoto(photo)
    setPreviewVisible(true)
    setStartCamera(false)
  }

  const clearPhoto = () => {
    setSavedPhoto(null)
    setPreviewVisible(false)
  }

  return (
    <View style={styles.container}>
      {!startCamera && !previewVisible && (
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
