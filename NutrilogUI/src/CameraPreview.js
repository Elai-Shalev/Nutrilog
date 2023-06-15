import { View, ImageBackground, Text } from 'react-native';

const CameraPreview = ({ photo }) => {
  return (
    <View
      style={{
        width: 300,
        height: 300,
      }}
    >
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'pink', fontSize: 45, fontWeight: 800 }}>Preview:</Text>
      </View>
      <ImageBackground
        resizeMode='contain'
        source={{uri: photo && photo.uri}}
        style={{
          flex: 1,
        }}
      />
    </View>
  )
}

export default CameraPreview;