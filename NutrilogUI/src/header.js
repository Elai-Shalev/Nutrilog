import { View, Text, Image } from "react-native";

const Header = () => {
  return (
    <View style={ImageDesign}>
      <Text style={NutriLogDesign}>NutriLog App</Text>
      <Image
        source={require("../assets/pinkScale.jpg")}
        style={{ width: 200, height: 200 }}
      />
      <TextComponent cmd="Please press the button to add a meal:" />
    </View>
  );
};

const NutriLogDesign = {
  color: "pink",
  fontSize: 70,
  fontWeight: 900,
};

const ImageDesign = {
  //flex:1,
  justifyContent: "center",
  alignItems: "center",
};

const CmdDesign = {
  color: "#d14974",
  textAlign: "center",
  fontSize: 25,
  fontWeight: 800,
};

const TextComponent = ({ cmd }) => {
  return <Text style={CmdDesign}>{cmd}</Text>;
};

export default Header;
