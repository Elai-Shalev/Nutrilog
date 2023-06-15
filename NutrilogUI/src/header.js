import { View, Text } from 'react-native'

const Header = () => {
    return (
        <View>
            <Text style={NutriLogDesign}>NutriLog App</Text>
            <TextComponent cmd="Please press the button to add a meal:" />
        </View>
    )
}

const NutriLogDesign = {
    color: 'pink',
    fontSize: 70,
    fontWeight: 800
}

const CmdDesign = {
    color: '#d14974',
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 500
}

const TextComponent = ({ cmd }) => {
    return <Text style={CmdDesign}>{cmd}</Text>
}

export default Header;