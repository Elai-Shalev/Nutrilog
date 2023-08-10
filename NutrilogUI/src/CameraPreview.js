import { View, ImageBackground, Text } from "react-native";

const CameraPreview = ({ photo }) => {
  return (
    <View
      style={{
        width: 550,
        height: 550,
      }}
    >
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "pink", fontSize: 50, fontWeight: 800 }}>
          Preview:
        </Text>
      </View>
      <ImageBackground
        resizeMode="contain"
        source={{ uri: photo && photo.uri }}
        style={{
          flex: 1,
        }}
      />
    </View>
  );
};

export default CameraPreview;
