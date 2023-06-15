import { useState, useEffect } from 'react';
import { StyleSheet ,Text, View, Button, Image, Alert} from 'react-native';
import { Camera } from 'expo-camera';

export const Counter = () => {
	const [count, setCount] = useState(0)

	useEffect(() => {
		if (count % 2 === 0) {
			Alert.alert("Zugi!!!!")
		}
	}, [count,])

	
  return (
    <View>
			<Button onPress={() => setCount(count+1)} title="Increment" />
			<Text>count: {count}</Text>
    </View>
  )
}