import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import DiaryEditScreen from './DiaryEditScreen.js';
import { AppRegistry } from 'react-native';
import appJson from './app.json'; // 追加

const appName = appJson.expo.name; // 追加


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DiaryEditScreen" component={DiaryEditScreen} options={{ title: '日記' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
AppRegistry.registerComponent(appName, () => App); // 修正