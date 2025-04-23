import { StyleSheet, Text, View, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SplashScreen
import SplashScreen from './src/Screens/SplashScreen/Index'

// AUth
import Login from './src/Screens/Auth/Login'
import OtpVerify from './src/Screens/Auth/OtpVerify'

// Pages
import Home from './src/Screens/Home/Index'
import ManualNitiPage from './src/Screens/ManualNitiPage/Index'
import Darshan from './src/Screens/Darshan/Index'
import MahaPrasad from './src/Screens/MahaPrasad/Index'
import HundiCollection from './src/Screens/HundiCollection/Index'
import Notice from './src/Screens/Notice/Index'

const Stack = createNativeStackNavigator()

export const base_url = "http://temple.mandirparikrama.com/"

const App = () => {

  const [showSplash, setShowSplash] = useState(true);
  const [access_token, setAccess_token] = useState("");

  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('storeAccesstoken');
      setAccess_token(token || "");
      console.log("Access Token: ", token || "Token not found");
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
    }
  };

  useEffect(() => {
    getAccessToken();
    setTimeout(() => {
      setShowSplash(false);
    }, 5000)
  }, []);

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#B7070A" barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showSplash ? (<Stack.Screen name="SplashScreen" component={SplashScreen} options={{ presentation: 'modal', animationTypeForReplace: 'push', animation: 'slide_from_right' }} />) : null}
        {access_token ? <Stack.Screen name="Home" component={Home} /> : <Stack.Screen name="Login" component={Login} />}
        {!access_token ? <Stack.Screen name="Home" component={Home} /> : <Stack.Screen name="Login" component={Login} />}
        <Stack.Screen name="OtpVerify" component={OtpVerify} />
        <Stack.Screen name="ManualNitiPage" component={ManualNitiPage} />
        <Stack.Screen name="Darshan" component={Darshan} />
        <Stack.Screen name="MahaPrasad" component={MahaPrasad} />
        <Stack.Screen name="HundiCollection" component={HundiCollection} />
        <Stack.Screen name="Notice" component={Notice} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})