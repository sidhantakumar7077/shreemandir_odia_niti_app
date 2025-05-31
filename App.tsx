import { StyleSheet, Text, View, StatusBar, TouchableOpacity, Alert, PermissionsAndroid, Platform, Linking, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';

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

// export const base_url = "http://temple.mandirparikrama.com/"
export const base_url = "https://shreejagannathadham.com/"

const App = () => {

  const [showUpdateModal, setShowUpdateModal] = useState(false); // control version update modal
  const [showDownloadModal, setShowDownloadModal] = useState(false); // control download progress modal
  const [downloadProgress, setDownloadProgress] = useState(0); // for showing % progress

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 33) {
      const writeGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      const readGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );

      return (
        writeGranted === PermissionsAndroid.RESULTS.GRANTED &&
        readGranted === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  const startDownload = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission denied to save file');
      ToastAndroid.show('Permission denied to save file', ToastAndroid.SHORT);
      return;
    }

    const apkUrl = 'https://shreejagannathadham.com/uploads/apk/1746098615.apk';
    const fileName = 'Niti App.apk';
    const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    try {
      setShowUpdateModal(false);
      setShowDownloadModal(true);
      setDownloadProgress(0);

      interface DownloadOptions {
        fromUrl: string;
        toFile: string;
        begin?: (res: RNFS.DownloadBeginCallbackResult) => void;
        progress?: (res: RNFS.DownloadProgressCallbackResult) => void;
      }

      const options: DownloadOptions = {
        fromUrl: apkUrl,
        toFile: downloadDest,
        begin: (res: RNFS.DownloadBeginCallbackResult) => {
          console.log('Download started');
        },
        progress: (res: RNFS.DownloadProgressCallbackResult) => {
          const percentage = Math.floor((res.bytesWritten / res.contentLength) * 100);
          setDownloadProgress(percentage);
        },
      };

      const download = RNFS.downloadFile(options);
      const result = await download.promise;

      setShowDownloadModal(false);
      setDownloadProgress(0);

      if (result.statusCode === 200) {
        // Alert.alert('Download complete!', 'Please install the APK from your Downloads folder.');
        ToastAndroid.show('Download complete! Please install the APK from your Downloads folder.', ToastAndroid.LONG);

        // Optional: Open settings for installation
        // if (Platform.OS === 'android') {
        //   Linking.openSettings(); // OR use intent to open APK directly
        // }
      } else {
        ToastAndroid.show('Download failed with status code: ' + result.statusCode, ToastAndroid.LONG);
        // throw new Error('Failed with status code ' + result.statusCode);
      }
    } catch (error) {
      console.error('Download error:', error);
      setShowDownloadModal(false);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      // Alert.alert('Download failed.', errorMessage);
      ToastAndroid.show('Download failed: ' + errorMessage, ToastAndroid.LONG);
    }
  };

  const isNewerVersion = (latest: string, current: string): boolean => {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < latestParts.length; i++) {
      if ((latestParts[i] || 0) > (currentParts[i] || 0)) return true;
      if ((latestParts[i] || 0) < (currentParts[i] || 0)) return false;
    }
    return false;
  };

  const [showSplash, setShowSplash] = useState(true);
  const [access_token, setAccess_token] = useState("");

  interface LatestApkData {
    id: number;
    version: string;
    apk_file: string;
    status: string;
    created_at: string;
    updated_at: string;
  }
  const [latestVersionData, setLatestVersionData] = useState<LatestApkData | null>(null);

  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem('storeAccesstoken');
      setAccess_token(token || "");
      console.log("Access Token: ", token || "Token not found");
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
    }
  };

  const getLatestVersion = async () => {
    try {
      const response = await fetch(`${base_url}api/latest-apk`);
      const json: { status: boolean; data: LatestApkData } = await response.json();
      if (response.ok && json.status) {
        setLatestVersionData(json.data);
      } else {
        console.error('Failed to fetch latest version');
      }
    } catch (error) {
      console.error('Error fetching latest version:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await getAccessToken();
      await getLatestVersion();
      setTimeout(() => {
        setShowSplash(false);
      }, 2000);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (!latestVersionData || showSplash) return;

    const currentVersion = DeviceInfo.getVersion();
    const latestVersion = latestVersionData.version;

    console.log("Current Version: ", currentVersion);
    console.log("Latest Version: ", latestVersion);

    if (isNewerVersion(latestVersion, currentVersion)) {
      setTimeout(() => {
        setShowUpdateModal(true);
      }, 300);
    }
  }, [latestVersionData, showSplash]);

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

      {/* Version Update Modal */}
      {showUpdateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Available</Text>
            <Text style={styles.modalDesc}>A newer version of this app is available. Please Upgrade the App to continue.</Text>
            <TouchableOpacity onPress={startDownload} style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>Download & Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Download Progress Modal */}
      {showDownloadModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Downloading...</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${downloadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{downloadProgress}%</Text>
          </View>
        </View>
      )}

    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  modalDesc: {
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: '#B7070A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B7070A',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
})