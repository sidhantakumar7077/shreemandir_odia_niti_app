import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView, Modal, TextInput, BackHandler, ToastAndroid, RefreshControl, Animated, Easing } from 'react-native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import { base_url } from '../../../App';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import DrawerModal from '../../Components/DrawerModal';
import NoticeBanner from '../../Components/NoticeBanner';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import DatePicker from 'react-native-date-picker';

const Index = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOtherNitiModalVisible, setIsOtherNitiModalVisible] = useState(false);
  const [isSuchanaModalVisible, setIsSuchanaModalVisible] = useState(false);
  const [suchanaText, setSuchanaText] = useState('');
  const [suchanaEngText, setSuchanaEngText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => { setIsDrawerOpen(false); };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      getAllNiti();
      getCompletedNiti();
      getOtherNiti();
      getFestivalNiti();
      getNotice();
      getDarshan();
      console.log("Refreshing Successful");
    }, 2000);
  }, []);

  const [spinner, setSpinner] = useState(false);
  const [allNiti, setAllNiti] = useState([]);
  const [suchana, setSuchana] = useState(null);
  const [completedNiti, setCompletedNiti] = useState([]);
  const [otherNiti, setOtherNiti] = useState([]);
  const [otherNitiText, setOtherNitiText] = useState('');
  const [otherEngNitiText, setOtherEngNitiText] = useState('');
  const [runningTimers, setRunningTimers] = useState({});
  const [festivalNiti, setFestivalNiti] = useState([]);
  const [selectedFestivalId, setSelectedFestivalId] = useState(null);

  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const updatedTimers = {};

  //     allNiti.forEach(item => {
  //       if (item.start_time && item.niti_status === "Started") {
  //         // const start = moment(item.start_time, "HH:mm:ss");
  //         // const now = moment();
  //         const start = moment("23:50:00", "HH:mm:ss");
  //         const now = moment("00:10:00", "HH:mm:ss");
  //         const duration = moment.duration(now.diff(start));

  //         const hours = String(duration.hours()).padStart(2, '0');
  //         const minutes = String(duration.minutes()).padStart(2, '0');
  //         const seconds = String(duration.seconds()).padStart(2, '0');

  //         updatedTimers[item.niti_id] = `${hours}:${minutes}:${seconds}`;
  //       }
  //     });

  //     setRunningTimers(updatedTimers);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [allNiti]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers = {};

      allNiti.forEach(item => {
        if (item.start_time && item.niti_status === "Started") {
          const start = moment(item.start_time, "HH:mm:ss");
          const now = moment();
          // const start = moment("00:10:00", "HH:mm:ss");
          // const now = moment("01:20:00", "HH:mm:ss");

          // Fix for negative duration at midnight
          if (start.isAfter(now)) {
            start.subtract(1, 'day');
          }

          const duration = moment.duration(now.diff(start));

          const hours = String(duration.hours()).padStart(2, '0');
          const minutes = String(duration.minutes()).padStart(2, '0');
          const seconds = String(duration.seconds()).padStart(2, '0');

          updatedTimers[item.niti_id] = `${hours}:${minutes}:${seconds}`;
        }
      });

      setRunningTimers(updatedTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [allNiti]);

  const [backPressCount, setBackPressCount] = useState(0);

  useEffect(() => {
    const handleBackPress = () => {
      if (backPressCount === 1) {
        BackHandler.exitApp(); // Exit the app if back button is pressed twice within 2 seconds
        return true;
      }

      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      setBackPressCount(1);

      const timeout = setTimeout(() => {
        setBackPressCount(0);
      }, 2000); // Reset back press count after 2 seconds

      return true; // Prevent default behavior
    };

    if (isFocused) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      return () => backHandler.remove(); // Cleanup the event listener when the component unmounts or navigates away
    }
  }, [backPressCount, isFocused]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [startTimeEditModal, setStartTimeEditModal] = useState(false);
  const [endTimeEditModal, setEndTimeEditModal] = useState(false);
  const [selectedNiti, setSelectedNiti] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [niti_notDone_reasonModal, setNiti_notDone_reasonModal] = useState(false);
  const [niti_notDone_reason, setNiti_notDone_reason] = useState('');
  const [showEndOfTheNitiBtm, setShowEndOfTheNitiBtm] = useState(false);

  const clickStartTimeEdit = (nitiId, startTimeStr) => {
    const parts = startTimeStr.split(':');
    const now = new Date();
    now.setHours(parseInt(parts[0], 10));
    now.setMinutes(parseInt(parts[1], 10));
    now.setSeconds(parseInt(parts[2], 10));
    now.setMilliseconds(0);

    setSelectedNiti(nitiId);
    setStartTime(now); // ✅ Valid Date object
    setStartTimeEditModal(true);
  };

  const startTimeEdit = async () => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    const formattedTime = moment(startTime).format('HH:mm:ss');

    try {
      const response = await fetch(base_url + 'api/niti/edit-start-time', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niti_management_id: selectedNiti,
          start_time: formattedTime,
        }),
      });

      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        setStartTimeEditModal(false);
        setSelectedNiti(null);
        setStartTime(new Date());
        ToastAndroid.show('Start time edited successfully', ToastAndroid.SHORT);
      } else {
        setStartTimeEditModal(false);
        setSelectedNiti(null);
        ToastAndroid.show('Error editing start time', ToastAndroid.SHORT);
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log("Error editing start time:", error);
      ToastAndroid.show('Error editing start time', ToastAndroid.SHORT);
      setStartTimeEditModal(false);
      setSelectedNiti(null);
    }
  };

  const clickEndTimeEdit = (nitiId, startTimeStr, endTimeStr) => {
    const parts = endTimeStr.split(':');
    const now = new Date();
    now.setHours(parseInt(parts[0], 10));
    now.setMinutes(parseInt(parts[1], 10));
    now.setSeconds(parseInt(parts[2], 10));
    now.setMilliseconds(0);
    setSelectedNiti(nitiId);
    setEndTime(now); // ✅ Valid Date object
    setEndTimeEditModal(true);

    // For Start time
    const stparts = startTimeStr.split(':');
    const stnow = new Date();
    stnow.setHours(parseInt(stparts[0], 10));
    stnow.setMinutes(parseInt(stparts[1], 10));
    stnow.setSeconds(parseInt(stparts[2], 10));
    stnow.setMilliseconds(0);
    setStartTime(stnow); // ✅ Valid Date object
  };

  const endTimeEdit = async () => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    const formattedTime = moment(endTime).format('HH:mm:ss');
    // console.log("Selected Niti for End Time Edit:", selectedNiti, formattedTime);
    // return;

    try {
      const response = await fetch(base_url + 'api/niti/edit-end-time', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niti_management_id: selectedNiti,
          end_time: formattedTime,
        }),
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        setEndTimeEditModal(false);
        setSelectedNiti(null);
        setStartTime(new Date());
        ToastAndroid.show('End time edited successfully', ToastAndroid.SHORT);
        // console.log("End time edited successfully", responseData);
      } else {
        setEndTimeEditModal(false);
        setSelectedNiti(null);
        ToastAndroid.show('Error editing end time', ToastAndroid.SHORT);
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log("Error editing end time:", error);
      ToastAndroid.show('Error editing end time', ToastAndroid.SHORT);
      setEndTimeEditModal(false);
      setSelectedNiti(null);
    }
  };

  const showConfirmation = (actionType, data) => {
    setConfirmAction(actionType);
    setConfirmData(data);
    setConfirmVisible(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'start') startNiti(confirmData);
    // if (confirmAction === 'pause') pauseNiti(confirmData);
    // if (confirmAction === 'pause') setIsModalVisible(true);
    // if (confirmAction === 'resume') resumeNiti(confirmData);
    if (confirmAction === 'not done/skip') setNiti_notDone_reasonModal(true);
    if (confirmAction === 'reset') resetStartNiti(confirmData);
    if (confirmAction === 'stop') stopNiti(confirmData);
    if (confirmAction === 'delete') deleteOtherNiti(confirmData);
    setConfirmVisible(false);
  };

  const getAllNiti = async () => {
    try {
      setSpinner(true);
      const response = await fetch(base_url + 'api/manage-niti', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();
      if (responseData.status) {
        setSpinner(false);
        const filteredNiti = responseData.data.filter(item => item.niti_status !== "Completed");
        setAllNiti(filteredNiti);
        setSuchana(responseData.niti_info);
        setShowEndOfTheNitiBtm(true);
        // console.log("All Niti", responseData.niti_info);
      }
    } catch (error) {
      console.log(error);
      setSpinner(false);
      setShowEndOfTheNitiBtm(false);
    }
  };

  const getOtherNiti = async () => {
    try {
      const response = await fetch(base_url + 'api/get-mahasnana-niti', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();
      if (responseData.status) {
        setOtherNiti(responseData.data);
        // console.log("Other Niti", responseData.data);
      } else {
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFestivalNiti = async () => {
    try {
      const response = await fetch(base_url + 'api/today-festival-niti', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();
      if (responseData.status) {
        setFestivalNiti(responseData.data);
        // console.log("festivalNiti", responseData.data);
      } else {
        console.log("Error fetching festival Niti", responseData);
      }
    } catch (error) {
      console.log("Error fetching festival Niti", error);
    }
  };

  const getCompletedNiti = async () => {
    try {
      const response = await fetch(base_url + 'api/completed-niti', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();
      if (responseData.status) {
        setCompletedNiti(responseData.data);
        // console.log("Completed Niti", responseData.data);
      } else {
        console.log("Error fetching completed Niti", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const startNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/start-niti', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niti_id: id,
        }),
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        getDarshan();
        setConfirmData(null);
        console.log("Niti started successfully", responseData);
      } else {
        getAllNiti();
        getCompletedNiti();
        getDarshan();
        setConfirmData(null);
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pauseNiti = async (id) => {
    // setIsModalVisible(true);
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/pause-niti', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niti_id: id
        }),
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        setConfirmData(null);
        console.log("Niti paused successfully", responseData);
      } else {
        getAllNiti();
        getCompletedNiti();
        setConfirmData(null);
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resumeNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/resume-niti', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niti_id: id
        }),
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        setConfirmData(null);
        console.log("Niti resumed successfully", responseData);
      } else {
        getAllNiti();
        getCompletedNiti();
        setConfirmData(null);
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const notDoneNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/niti/not-started', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niti_id: id,
          niti_not_done_reason: niti_notDone_reason,
        }),
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        getDarshan();
        setConfirmData(null);
        setNiti_notDone_reasonModal(false);
        setNiti_notDone_reason('');
        ToastAndroid.show('Niti marked as not done successfully', ToastAndroid.SHORT);
        // console.log("Niti marked as not done successfully", responseData);
      } else {
        getAllNiti();
        getCompletedNiti();
        getDarshan();
        // setConfirmData(null);
        ToastAndroid.show(responseData.message || 'Error marking Niti as not done', ToastAndroid.SHORT);
        // console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const resetStartNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/niti/reset', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niti_id: id,
        }),
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        getDarshan();
        setConfirmData(null);
        ToastAndroid.show('Niti reset successfully', ToastAndroid.SHORT);
        console.log("Niti reset successfully", responseData);
      } else {
        getAllNiti();
        getCompletedNiti();
        getDarshan();
        setConfirmData(null);
        ToastAndroid.show('Error resetting Niti', ToastAndroid.SHORT);
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const stopNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/stop-niti', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          niti_id: id,
        }),
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        getDarshan();
        setConfirmData(null);
        console.log("Niti stopped successfully", responseData);
      } else {
        getAllNiti();
        getCompletedNiti();
        getDarshan();
        setConfirmData(null);
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitOtherNiti = async () => {
    // pauseNiti(confirmData);
    const token = await AsyncStorage.getItem('storeAccesstoken');
    const selectedNiti = otherNiti.find(item => item.id === selectedItem);
    const payload = {
      niti_name: selectedNiti?.niti_name || otherNitiText,
      english_niti_name: otherEngNitiText || '',
      niti_id: selectedNiti?.niti_id || null,
    };

    try {
      const response = await fetch(`${base_url}api/save-other-niti`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status) {
        // console.log('Special Niti saved:', data);
        ToastAndroid.show('Niti added successfully', ToastAndroid.SHORT);
        setIsModalVisible(false);
        setIsOtherNitiModalVisible(false);
        setSelectedItem(null);
        setOtherNitiText('');
        getOtherNiti();
        getFestivalNiti();
        getAllNiti();
      } else {
        ToastAndroid.show(data.message || 'Failed to add special Niti', ToastAndroid.SHORT);
        // console.log("Error", data.message || 'Failed to add special Niti');
      }
    } catch (error) {
      // console.log('Error saving special Niti:', error);
      ToastAndroid.show('Error saving special Niti', ToastAndroid.SHORT);
    }
  };

  const [allOtherNiti, setAllOtherNiti] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const fetchAllOtherNiti = async () => {
    try {
      const res = await fetch(`${base_url}api/get-other-niti`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.status) {
        setAllOtherNiti(data.data);
        // console.log("All Other Niti", data.data);
      } else {
        console.log("Error fetching all Other Niti", data.message);
      }
    } catch (error) {
      console.log("Error fetching all Other Niti:", error);
    }
  };

  const filterSuggestions = (text, isEnglish = false) => {
    if (!text || text.length < 4) {
      setSuggestions([]);
      return;
    }

    const filtered = allOtherNiti.filter(item => {
      const value = isEnglish ? item.english_niti_name : item.niti_name;
      return value?.toLowerCase().includes(text.toLowerCase());
    });

    setSuggestions(filtered.slice(0, 5)); // limit to 5
  };

  const handleSuggestionSelect = item => {
    setOtherNitiText(item.niti_name);
    setOtherEngNitiText(item.english_niti_name);
    setSuggestions([]);
  };

  const deleteOtherNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    // console.log("Deleting Other Niti with ID:", id);
    // return;
    try {
      const response = await fetch(base_url + 'api/niti/delete-other/' + id, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        setConfirmData(null);
        console.log("Other Niti deleted successfully", responseData);
        ToastAndroid.show('Other Niti deleted successfully', ToastAndroid.SHORT);
      } else {
        getAllNiti();
        getCompletedNiti();
        setConfirmData(null);
        console.log("Error", responseData);
        ToastAndroid.show('Error deleting Other Niti', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error", error);
      ToastAndroid.show('Error deleting Other Niti', ToastAndroid.SHORT);
    }
  };

  const handleSubmitSuchana = async () => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/niti-information', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },

        body: JSON.stringify({
          niti_notice: suchanaText,
          niti_notice_english: suchanaEngText,
        }),
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getNotice();
        setSuchanaText('');
        setIsSuchanaModalVisible(false);
        console.log("Notice added successfully", responseData);
        ToastAndroid.show('Notice added successfully', ToastAndroid.SHORT);
      } else {
        console.log("Error", responseData);
        ToastAndroid.show('Error adding Notice', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error", error);
      ToastAndroid.show('Error adding Notice', ToastAndroid.SHORT);
    }
  };

  const handleDeleteSuchana = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/niti-information/' + id, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
      });
      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getNotice();
        getCompletedNiti();
        console.log("Notice deleted successfully", responseData);
        ToastAndroid.show('Notice deleted successfully', ToastAndroid.SHORT);
      } else {
        console.log("Error", responseData);
        ToastAndroid.show('Error deleting Notice', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error", error);
      ToastAndroid.show('Error deleting Notice', ToastAndroid.SHORT);
    }
  };

  const [deleteSuchanaVisible, setDeleteSuchanaVisible] = useState(false);

  const endNiti = async () => {
    // const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/update-upcoming', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        },
      });

      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        // console.log("Niti ended successfully", responseData);
        ToastAndroid.show('Niti ended successfully', ToastAndroid.SHORT);
      } else {
        getAllNiti();
        // console.log("Error", responseData);
        ToastAndroid.show('Error ending Niti', ToastAndroid.SHORT);
      }
    }
    catch (error) {
      // console.log("Error", error);
      ToastAndroid.show('Error ending Niti', ToastAndroid.SHORT);
    }
  };

  const [collapseNiti, setCollapseNiti] = useState(false);
  const [subNitiName, setSubNitiName] = useState('');

  const collapseSubNiti = (id) => {
    setCollapseNiti(prev => prev === id ? false : id);
  };

  const addSubNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/sub-niti/add', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sub_niti_name: subNitiName,
          niti_id: id,
        }),
      });

      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        setSubNitiName('');
        // setCollapseNiti(false);
        console.log("Sub Niti added successfully", responseData);
        ToastAndroid.show('Sub Niti added successfully', ToastAndroid.SHORT);
      } else {
        console.log("Error", responseData);
        ToastAndroid.show('Error adding Sub Niti', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);
      ToastAndroid.show('Error adding Sub Niti', ToastAndroid.SHORT);
    }
  };

  const startSubNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/sub-niti/start', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sub_niti_id: id,
        }),
      });

      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        console.log("Sub Niti started successfully", responseData);
        ToastAndroid.show('Sub Niti started successfully', ToastAndroid.SHORT);
      } else {
        console.log("Error", responseData);
        ToastAndroid.show('Error starting Sub Niti', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);
      ToastAndroid.show('Error starting Sub Niti', ToastAndroid.SHORT);
    }
  };

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editSubItem, setEditSubItem] = useState(null);
  const [visibleConfirmSubNitiDelete, setVisibleConfirmSubNitiDelete] = useState(false);

  const editModal = (item) => {
    setEditSubItem(item);
    setIsEditModalVisible(true);
  }

  const editSubNiti = async () => {
    // console.log("object", editSubItem);
    // return;
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/update-sub-niti-name/' + editSubItem.sub_niti_id, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sub_niti_name: editSubItem.sub_niti_name,
        }),
      });

      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        console.log("Sub Niti edited successfully", responseData);
        ToastAndroid.show('Sub Niti edited successfully', ToastAndroid.SHORT);
      } else {
        console.log("Error", responseData);
        ToastAndroid.show('Error editing Sub Niti', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error", error);
      ToastAndroid.show('Error editing Sub Niti', ToastAndroid.SHORT);
    }
  };

  const confirmDeleteSubNiti = (item) => {
    setVisibleConfirmSubNitiDelete(true);
    setEditSubItem(item);
  };

  const deleteSubNiti = async (id) => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    try {
      const response = await fetch(base_url + 'api/delete-sub-niti/' + id, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const responseData = await response.json();
      if (responseData.status) {
        getAllNiti();
        getCompletedNiti();
        console.log("Sub Niti deleted successfully", responseData);
        ToastAndroid.show('Sub Niti deleted successfully', ToastAndroid.SHORT);
      } else {
        console.log("Error", responseData);
        ToastAndroid.show('Error deleting Sub Niti', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error", error);
      ToastAndroid.show('Error deleting Sub Niti', ToastAndroid.SHORT);
    }
  };

  const [notice, setNotice] = useState({});

  const getNotice = async () => {
    try {
      const response = await fetch(base_url + 'api/latest-temple-notice', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();

      if (responseData.status) {
        // Get today's date in the same format as start_date and end_date
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        // Filter the notices to find valid ones for today
        const validNotices = responseData.data.filter(notice => {
          const startDate = new Date(notice.start_date);
          const endDate = new Date(notice.end_date);
          return startDate <= new Date(today) && endDate >= new Date(today);
        });
        // console.log("Valid Notices", validNotices);
        // Check if there are any valid notices
        if (validNotices.length > 0) {
          // Set the first valid notice to the state
          setNotice(validNotices[0]);
        } else {
          setNotice({});
          console.log("No valid notice for today.");
        }
      } else {
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [allDarshan, setAllDarshan] = useState([]);
  const [currentDarshan, setCurrentDarshan] = useState(null);
  const [editDarshanModal, setEditDarshanModal] = useState(false);
  const [selectedDarshanId, setSelectedDarshanId] = useState(null);

  const getDarshan = async () => {
    try {
      const response = await fetch(base_url + 'api/darshan/started-data', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const responseData = await response.json();
      if (responseData.status) {
        // console.log("Darshan Data", responseData.data);
        setAllDarshan(responseData.data);
        // Find the first one with darshan_status === "Started"
        const activeDarshan = responseData.data.find(item => item.darshan_status === "Started");
        setCurrentDarshan(activeDarshan || null);
      } else {
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log("Error fetching darshan data:", error);
    }
  };

  const editDarshan = async () => {
    const token = await AsyncStorage.getItem('storeAccesstoken');
    // console.log("Edit Darshan Request Body:", {
    //   darshan_id: selectedDarshanId,
    //   action: selectedDarshanId ? 'start' : 'closed',
    // });
    // return;

    try {
      const response = await fetch(base_url + 'api/darshan/edit', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          darshan_id: selectedDarshanId,
          action: selectedDarshanId ? 'start' : 'closed',
        }),
      });

      const responseData = await response.json();
      if (responseData.status) {
        getDarshan();
        setEditDarshanModal(false);
        setSelectedDarshanId(null);
        console.log("Darshan edited successfully", responseData);
        ToastAndroid.show('Darshan edited successfully', ToastAndroid.SHORT);
      } else {
        console.log("Error", responseData);
        ToastAndroid.show('Error editing Darshan', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error editing Darshan:", error);
      ToastAndroid.show('Error editing Darshan', ToastAndroid.SHORT);
      setEditDarshanModal(false);
      setSelectedDarshanId(null);
    }
  };

  const tryAgain = () => {
    getAllNiti();
    getCompletedNiti();
    getOtherNiti();
    getFestivalNiti();
    getNotice();
    getDarshan();
  };

  useEffect(() => {
    if (isFocused) {
      getAllNiti();
      getCompletedNiti();
      getOtherNiti();
      getFestivalNiti();
      getNotice();
      getDarshan();
      fetchAllOtherNiti();
    }
  }, [isFocused]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFBE00', opacity: isModalVisible && isDrawerOpen ? 0.8 : 1 }}>
      <DrawerModal visible={isDrawerOpen} navigation={navigation} onClose={closeDrawer} />
      {/* Header Section */}
      <View style={styles.headerPart}>
        <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={{ marginHorizontal: 10 }}>
            <FontAwesome5 name="bars" size={25} color="#fff" />
          </TouchableOpacity>
          {/* <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>ଦୈନିକ ନୀତି</Text> */}
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: 8 }}>
            <TouchableOpacity onPress={() => setIsSuchanaModalVisible(true)} style={{ backgroundColor: 'green', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>ନୀତି ସୂଚନା</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginRight: 8 }}>
            <TouchableOpacity onPress={() => setIsOtherNitiModalVisible(true)} style={{ backgroundColor: 'green', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>ବିଶେଷ ନୀତି</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginRight: 8 }}>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ backgroundColor: 'green', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>ଅକସ୍ମାତ୍ ନୀତି</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Notice Banner */}
        {notice && notice.notice_name &&
          <NoticeBanner noticeText={notice.notice_name} />
        }
        {/* Running Niti or previous Niti */}
        {/* {(allNiti.some(niti => niti.niti_status === "Started") || completedNiti.length > 0) && (
          <View style={{
            backgroundColor: '#fff',
            paddingHorizontal: 20,
            paddingVertical: 18,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            marginBottom: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ width: '75%' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#341551' }}>
                  {
                    allNiti.find(n => n.niti_status === "Started")?.niti_name ??
                    completedNiti[completedNiti.length - 1]?.niti_name ??
                    "No Niti"
                  }
                </Text>
                <View style={{ backgroundColor: '#fa0000', width: 80, height: 1.5, marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={16} color="#fa0000" />
                    <Text style={{ color: '#979998', fontWeight: '500', marginLeft: 5 }}>
                      {moment().format("Do MMMM")}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={16} color="#fa0000" />
                    <Text style={{ color: '#979998', fontWeight: '500', marginLeft: 5 }}>
                      {
                        moment(
                          allNiti.find(n => n.niti_status === "Started")?.start_time ??
                          completedNiti[completedNiti.length - 1]?.start_time, "HH:mm:ss"
                        ).format("hh:mm A")
                      }
                    </Text>
                  </View>
                </View>
                {allNiti.find(n => n.niti_status === "Started") && (
                  <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', marginTop: 8 }}>
                    ⏱️ ନୀତି ଚାଲିଥିବା ସମୟ: <Text style={{ color: '#fa0000' }}>{runningTimers[allNiti.find(n => n.niti_status === "Started")?.niti_id] || '00:00:00'}</Text>
                  </Text>
                )}
              </View>
              <View style={{ alignItems: 'center' }}>
                {allNiti.find(n => n.niti_status === "Started") ? (
                  <View style={{
                    backgroundColor: '#28a745',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    marginBottom: 6,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 19, fontWeight: '600', letterSpacing: 2 }}>ଚାଲୁଛି</Text>
                  </View>
                ) : completedNiti.length > 0 ? (
                  <View style={{
                    backgroundColor: '#6c757d',
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    marginBottom: 6,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 19, fontWeight: '600', letterSpacing: 2 }}>ପୂର୍ବ ନୀତି</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )} */}
        {/* Current Darshan */}
        {currentDarshan ?
          <View style={styles.nitiCell}>
            <TouchableOpacity
              style={{ width: '80%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => {
                setSelectedDarshanId(currentDarshan?.id);
                setEditDarshanModal(true);
              }}
            >
              <Text style={{ color: '#000', fontSize: 22, fontWeight: '600', textAlign: 'center' }}>ଦର୍ଶନ: </Text>
              <Animated.View style={{ opacity: opacity }}>
                <Text style={{ color: '#B7070A', fontSize: 22, fontWeight: '600', textAlign: 'center' }}>{currentDarshan?.darshan_name}</Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: 60, height: 35, backgroundColor: 'green', borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => {
                setSelectedDarshanId(currentDarshan?.id);
                setEditDarshanModal(true);
              }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          :
          <View style={styles.nitiCell}>
            <TouchableOpacity
              style={{ width: '80%' }}
              onPress={() => {
                setSelectedDarshanId(null);
                setEditDarshanModal(true);
              }}
            >
              <Text style={{ color: '#000', fontSize: 22, fontWeight: '600', textAlign: 'center' }}>ଦର୍ଶନ ବନ୍ଦ ଅଛି</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: 60, height: 35, backgroundColor: 'green', borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => {
                setSelectedDarshanId(currentDarshan?.id);
                setEditDarshanModal(true);
              }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Edit</Text>
            </TouchableOpacity>
          </View>
        }
        {/* Today Date */}
        <View style={{ backgroundColor: '#FFBE00', marginTop: 1 }}>
          <View style={{ backgroundColor: '#B7070A', paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{moment().format("MMMM Do YYYY, dddd")}</Text>
          </View>
        </View>
        {suchana && suchana.niti_notice && (
          <SwipeRow
            rightOpenValue={-50}
            disableRightSwipe
            style={{ marginTop: 1 }}
          >
            {/* Hidden Row (Delete Button) */}
            <TouchableOpacity
              style={{ justifyContent: 'center', alignItems: 'flex-end', backgroundColor: '#B7070A', height: '100%', paddingRight: 15 }}
              onPress={() => setDeleteSuchanaVisible(true)}
            >
              <FontAwesome name="trash" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Front Row (Notice Display) */}
            <View style={{ backgroundColor: '#fff', padding: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Fontisto name="onenote" size={20} color="#e65100" />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>{suchana.niti_notice_english}</Text>
                <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>{suchana.niti_notice}</Text>
              </View>
            </View>
          </SwipeRow>
        )}
        {/* Tabs for Upcoming and Completed Niti */}
        <View style={{ backgroundColor: '#FFBE00', width: '100%', flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setActiveTab('upcoming')} style={{ width: '50%', alignItems: 'center', padding: 10 }}>
            <Text style={{ color: activeTab === 'upcoming' ? '#B7070A' : '#444545', fontSize: activeTab === 'upcoming' ? 20 : 18, fontWeight: 'bold' }}>ଆଗାମୀ ନୀତି</Text>
            <View style={{ backgroundColor: activeTab === 'upcoming' ? '#B7070A' : '#444545', width: '100%', height: activeTab === 'upcoming' ? 2 : 1, marginTop: 5 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('complete')} style={{ width: '50%', alignItems: 'center', padding: 10 }}>
            <Text style={{ color: activeTab === 'complete' ? '#B7070A' : '#444545', fontSize: activeTab === 'complete' ? 20 : 18, fontWeight: 'bold' }}>ନୀତି ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଛି</Text>
            <View style={{ backgroundColor: activeTab === 'complete' ? '#B7070A' : '#444545', width: '100%', height: activeTab === 'complete' ? 2 : 1, marginTop: 5 }} />
          </TouchableOpacity>
        </View>
        {/* Niti List */}
        {activeTab === 'upcoming' ? (
          <View style={styles.cell}>
            <SwipeListView
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              data={allNiti}
              keyExtractor={(item) => item.niti_id.toString()}
              renderItem={({ item, index }) => (
                <View style={[styles.smallCell1, { height: (index === 0 && (item.niti_status === "Started" || item.niti_status === "Paused")) ? 120 : 'auto', justifyContent: 'center', borderColor: index === 0 ? '#B7070A' : '#ddd', borderWidth: index === 0 ? 1 : 0 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ width: '60%' }}>
                      {item.niti_status === "Upcoming" ? (
                        <Text style={{ color: '#000', fontSize: (index === 0 && (item.niti_status === "Started" || item.niti_status === "Paused")) ? 20 : 16, fontWeight: '600', textTransform: 'capitalize' }}>
                          {item.niti_name}
                        </Text>
                      ) : (
                        <View style={{ width: '100%' }}>
                          <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', textTransform: 'capitalize' }}>{item.niti_name}</Text>
                          <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>ଆରମ୍ଭ ସମୟ: {moment(item.start_time, "HH:mm:ss").format("HH:mm")}</Text>
                          <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>ଚାଲିଥିବା ସମୟ: {runningTimers[item.niti_id] || '00:00:00'}</Text>
                          {/* {item.running_sub_niti && item.running_sub_niti.sub_niti_name &&
                              <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>Current Sub Niti: <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{item.running_sub_niti.sub_niti_name}</Text></Text>
                            } */}
                        </View>
                      )}
                    </View>
                    <View style={{ width: '40%', alignItems: 'center' }}>
                      {/* {item.niti_status === "Upcoming" && (index === 0 || index === 1 || index === 2 || index === 3) && */}
                      {item.niti_status === "Upcoming" &&
                        <>
                          <TouchableOpacity
                            style={{
                              // backgroundColor: (index === 0 || index === 1 || index === 2 || index === 3) ? 'green' : '#ccc',
                              width: 80,
                              height: 40,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: 'green',
                              paddingVertical: 7,
                              paddingHorizontal: 10,
                              borderRadius: 5,
                            }}
                            // disabled={!([0, 1, 2, 3].includes(index))}
                            onPress={() => showConfirmation('start', item.niti_id)}
                          >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Start</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              // backgroundColor: (index === 0 || index === 1 || index === 2 || index === 3) ? '#6ea1f5' : '#ccc',
                              width: 80,
                              height: 40,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: '#6ea1f5',
                              paddingVertical: 7,
                              paddingHorizontal: 5,
                              borderRadius: 5,
                              marginTop: 10
                            }}
                            // disabled={!([0, 1, 2, 3].includes(index))}
                            onPress={() => showConfirmation('not done/skip', item.niti_id)}
                          >
                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Not Done</Text>
                          </TouchableOpacity>
                        </>
                      }
                      {/* {(index === 0 || index === 1 || index === 2 || index === 3) ? ( */}
                      <>
                        {(item.niti_status === "Started" || item.niti_status === "Paused") &&
                          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'space-evenly' }}>
                            <TouchableOpacity
                              style={{
                                width: 80,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#B7070A',
                                paddingVertical: 7,
                                paddingHorizontal: 10,
                                borderRadius: 5
                              }}
                              onPress={() => showConfirmation('stop', item.niti_id)}
                            >
                              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Stop</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                width: 80,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#1a2a87',
                                paddingVertical: 7,
                                paddingHorizontal: 10,
                                borderRadius: 5,
                                marginTop: 10
                              }}
                              onPress={() => showConfirmation('reset', item.niti_id)}
                            >
                              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Reset</Text>
                            </TouchableOpacity>
                          </View>
                        }
                      </>
                      {/* ) : (
                        <TouchableOpacity
                          style={{
                            backgroundColor: (index === 0 || index === 1 || index === 2 || index === 3) ? 'green' : '#ccc',
                            paddingVertical: 7,
                            paddingHorizontal: 10,
                            borderRadius: 5,
                          }}
                          disabled={!([0, 1, 2, 3].includes(index))}
                          onPress={() => showConfirmation('start', item.niti_id)}
                        >
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Start</Text>
                        </TouchableOpacity>
                      )} */}
                    </View>
                  </View>
                  {/* {collapseNiti === item.niti_id && <View style={{ width: '100%', height: 1, backgroundColor: '#ddd', marginTop: 10 }} />} */}
                  {/* Sub Niti Text Area Input Box */}
                  {/* {collapseNiti === item.niti_id && (item.niti_type === "daily" || item.niti_type === "special") && (item.niti_status === "Started" || item.niti_status === "Paused") && (
                      <View style={{ marginTop: 10, paddingHorizontal: 10 }}>
                        <FlatList
                          data={item.running_sub_niti}
                          keyExtractor={subItem => subItem.sub_niti_id.toString()}
                          renderItem={({ item: subItem }) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 0.5, borderColor: '#ddd' }}>
                              <View style={{ width: '70%' }}>
                                <Text style={{ color: '#000', fontSize: 15, fontWeight: '600' }}>
                                  {subItem.sub_niti_name}
                                </Text>
                                <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>
                                  ଆରମ୍ଭ ସମୟ: {moment(subItem.start_time, "HH:mm:ss").format("HH:mm")}
                                </Text>
                              </View>
                              <View style={{ width: '30%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                  onPress={() => editModal(subItem)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 14,
                                    borderRadius: 8,
                                  }}
                                >
                                  <FontAwesome name="edit" size={20} color="#B7070A" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => confirmDeleteSubNiti(subItem)}
                                  style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 14,
                                    borderRadius: 8,
                                  }}
                                >
                                  <FontAwesome name="trash" size={20} color="#B7070A" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          )}
                        />
                        <Modal
                          visible={isEditModalVisible}
                          transparent
                          animationType="slide"
                          onRequestClose={() => setIsEditModalVisible(false)}
                        >
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                            <View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 10, padding: 20 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>ଏଡିଟ ଉପନୀତି</Text>
                                <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={{ marginBottom: 6 }}>
                                  <FontAwesome name="close" size={25} color="#B7070A" />
                                </TouchableOpacity>
                              </View>
                              <TextInput
                                placeholder="ଏଡିଟ ଉପନୀତି..."
                                placeholderTextColor="#888"
                                value={editSubItem?.sub_niti_name}
                                onChangeText={text => setEditSubItem({ ...editSubItem, sub_niti_name: text })}
                                multiline={true}
                                numberOfLines={4}
                                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, color: '#000', textAlignVertical: 'top' }}
                              />
                              <TouchableOpacity
                                style={{
                                  backgroundColor: '#B7070A',
                                  paddingVertical: 7,
                                  paddingHorizontal: 10,
                                  borderRadius: 5,
                                  marginTop: 10,
                                }}
                                onPress={() => {
                                  editSubNiti();
                                  setIsEditModalVisible(false);
                                }}
                              >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Edit Sub Niti</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </Modal>
                        <Modal
                          visible={visibleConfirmSubNitiDelete}
                          transparent
                          animationType="fade"
                          onRequestClose={() => setVisibleConfirmSubNitiDelete(false)}
                        >
                          <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{
                              width: '85%',
                              backgroundColor: '#fff',
                              borderRadius: 16,
                              padding: 25,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 3 },
                              shadowOpacity: 0.3,
                              shadowRadius: 10,
                              elevation: 6,
                            }}>
                              <Text style={{ fontSize: 20, fontWeight: '700', color: '#B7070A', marginBottom: 10, textAlign: 'center' }}>
                                🗑️ ନିଶ୍ଚିତ କରନ୍ତୁ
                              </Text>

                              <Text style={{ fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 25 }}>
                                ଆପଣ ଏହି ନୀତିକୁ ବିଲୋପ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି ? ଏହି କାର୍ଯ୍ୟକୁ ପୂର୍ବବତ୍ କରାଯାଇପାରିବ ନାହିଁ।
                              </Text>

                              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                  onPress={() => setVisibleConfirmSubNitiDelete(false)}
                                  style={{
                                    backgroundColor: '#E0E0E0',
                                    paddingVertical: 10,
                                    paddingHorizontal: 25,
                                    borderRadius: 10,
                                    flex: 1,
                                    marginRight: 10,
                                    alignItems: 'center',
                                  }}
                                >
                                  <Text style={{ color: '#333', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => {
                                    deleteSubNiti(editSubItem.sub_niti_id);
                                    setVisibleConfirmSubNitiDelete(false);
                                  }}
                                  style={{
                                    backgroundColor: '#B7070A',
                                    paddingVertical: 10,
                                    paddingHorizontal: 25,
                                    borderRadius: 10,
                                    flex: 1,
                                    marginLeft: 10,
                                    alignItems: 'center',
                                  }}
                                >
                                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </Modal>
                        <TextInput
                          placeholder="ଉପନୀତି ଯୋଡନ୍ତୁ..."
                          placeholderTextColor="#888"
                          value={subNitiName}
                          onChangeText={text => setSubNitiName(text)}
                          multiline={true}
                          // numberOfLines={4}
                          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, color: '#000', textAlignVertical: 'top', marginTop: 10 }}
                        />
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#B7070A',
                            paddingVertical: 7,
                            paddingHorizontal: 10,
                            borderRadius: 5,
                            marginTop: 10,
                          }}
                          onPress={() => addSubNiti(item.niti_id)}
                        >
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Add Sub Niti</Text>
                        </TouchableOpacity>
                      </View>
                    )} */}
                  {/* Sub Niti List */}
                  {/* {collapseNiti === item.niti_id && item.sub_nitis.length > 0 && (
                      item.sub_nitis
                        .filter(subItem => subItem.status === "Upcoming" || subItem.status === "Running")
                        .map((subItem) => (
                          <View
                            key={subItem.id}
                            style={{
                              backgroundColor: '#dce8fa',
                              marginVertical: 6,
                              marginHorizontal: 10,
                              padding: 12,
                              borderRadius: 12,
                              borderLeftWidth: 5,
                              borderLeftColor: subItem.status === "Running" ? '#00B894' : '#FFD700',
                              shadowColor: '#000',
                              shadowOpacity: 0.05,
                              shadowOffset: { width: 0, height: 2 },
                              elevation: 2,
                            }}
                          >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <View style={{ width: '70%' }}>
                                <Text style={{ color: '#341551', fontSize: 15, fontWeight: '600' }}>
                                  {subItem.name}
                                </Text>
                              </View>

                              {subItem.status === "Upcoming" ? (
                                <TouchableOpacity
                                  onPress={() => startSubNiti(subItem.id)}
                                  style={{
                                    backgroundColor: '#28A745',
                                    paddingVertical: 6,
                                    paddingHorizontal: 14,
                                    borderRadius: 8,
                                  }}
                                >
                                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Start</Text>
                                </TouchableOpacity>
                              ) : (
                                <View style={{
                                  backgroundColor: '#FF7043',
                                  paddingHorizontal: 12,
                                  paddingVertical: 5,
                                  borderRadius: 20,
                                }}>
                                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Running</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        ))
                    )} */}
                </View>
              )}
              renderHiddenItem={({ item }) =>
                item.niti_type === "other" && item.status === "active" ? (
                  <View style={styles.rowBack}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => showConfirmation('delete', item.niti_id)}
                    >
                      <FontAwesome name="trash" size={30} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : null
              }
              rightOpenValue={-80}
            />
            {allNiti.length === 0 &&
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#B7070A',
                    paddingVertical: 12,
                    paddingHorizontal: 30,
                    borderRadius: 8,
                    elevation: 3
                  }}
                  onPress={() => {
                    if (showEndOfTheNitiBtm) {
                      endNiti();
                    } else {
                      tryAgain();
                    }
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                    {showEndOfTheNitiBtm && allNiti.length === 0 ? 'End of Niti' : 'Try Again'}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        ) : (
          <View style={styles.cell}>
            <FlatList
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              data={[...completedNiti].reverse()}
              keyExtractor={(item, index) => `main-${item.niti_id}-${index}`}
              renderItem={({ item }) => (
                <View style={{
                  backgroundColor: '#fff',
                  marginBottom: 12,
                  padding: 15,
                  borderRadius: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                  <Text style={{ color: '#1a1a1a', fontSize: 16, fontWeight: '700', marginBottom: 5 }}>
                    {item.niti_name}
                  </Text>

                  {/* Start Time Block */}
                  <View style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 15, color: '#333' }}>ସମ୍ପାଦିତ ସମୟ: {moment(item.start_time, "HH:mm:ss").format("HH:mm:ss")}</Text>
                      <TouchableOpacity onPress={() => clickStartTimeEdit(item.id, item.start_time)}>
                        <Feather name="edit-3" size={18} color="#555" />
                      </TouchableOpacity>
                    </View>
                    {item.start_user_id && (
                      <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                        ➤ ଆରମ୍ଭ: {item.start_user_id} ({item.start_user_name})
                      </Text>
                    )}
                    {item.start_time_edit_user_id && (
                      <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                        ✎ ଆରମ୍ଭ ସଂଶୋଧନ: {item.start_time_edit_user_id} ({item.start_time_edit_user_name})
                      </Text>
                    )}
                  </View>

                  {/* End Time Block */}
                  {item.niti_status === "Completed" && (
                    <>
                      <View style={{ marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 15, color: '#333' }}>ସମାପନ ସମୟ: {moment(item.end_time, "HH:mm:ss").format("HH:mm:ss")}</Text>
                          <TouchableOpacity onPress={() => clickEndTimeEdit(item.id, item.start_time, item.end_time)}>
                            <Feather name="edit-3" size={18} color="#555" />
                          </TouchableOpacity>
                        </View>
                        {item.end_user_id && (
                          <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                            ➤ ସମାପନ: {item.end_user_id} ({item.end_user_name})
                          </Text>
                        )}
                        {item.end_time_edit_user_id && (
                          <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                            ✎ ସମାପନ ସଂଶୋଧନ: {item.end_time_edit_user_id} ({item.end_time_edit_user_name})
                          </Text>
                        )}
                      </View>

                      {/* Duration */}
                      <View style={{
                        backgroundColor: '#f0f4ff',
                        padding: 8,
                        borderRadius: 8,
                        alignSelf: 'flex-start',
                        marginBottom: 10,
                      }}>
                        {(() => {
                          const start = moment(item.start_time, "HH:mm:ss");
                          let end = moment(item.end_time, "HH:mm:ss");
                          if (end.isBefore(start)) end.add(1, 'day');
                          const duration = moment.duration(end.diff(start));
                          const hours = String(duration.hours()).padStart(2, '0');
                          const minutes = String(duration.minutes()).padStart(2, '0');
                          const seconds = String(duration.seconds()).padStart(2, '0');
                          return (
                            <Text style={{ fontSize: 13, fontWeight: '500', color: '#222' }}>
                              🕒 ମୋଟ ଅବଧି: {hours}:{minutes}:{seconds}
                            </Text>
                          );
                        })()}
                      </View>
                    </>
                  )}

                  {/* Not Done Block */}
                  {item.niti_status === "NotStarted" && (
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, color: '#B7070A', fontWeight: '600' }}>
                        ସମ୍ପାଦିତ: {item.not_done_user_id}  ({item.not_done_user_name})
                      </Text>
                    </View>
                  )}

                  {/* Status */}
                  <View style={{
                    backgroundColor: item.niti_status === 'Completed'
                      ? '#d4edda'
                      : item.niti_status === 'Started'
                        ? '#fff3cd'
                        : '#f8d7da',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    alignSelf: 'flex-start',
                  }}>
                    <Text style={{
                      color: item.niti_status === 'Completed' ? '#155724' : '#856404',
                      fontSize: 13,
                      fontWeight: '600',
                    }}>
                      {
                        item.niti_status === 'Completed'
                          ? '✔ ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଛି'
                          : item.niti_status === 'Started'
                            ? '⌛ ଚାଲୁଛି'
                            : '❌ ନୀତି ହୋଇନାହିଁ'
                      }
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>

      <Modal visible={startTimeEditModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20, paddingTop: 10, alignItems: 'center', elevation: 5, width: 300, position: 'relative' }}>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setStartTimeEditModal(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
                padding: 5,
              }}
            >
              <Text style={{ fontSize: 18, color: '#000' }}>✕</Text>
              {/* Or use Icon like Feather name="x" */}
            </TouchableOpacity>

            <DatePicker
              mode="time"
              date={startTime}
              onDateChange={setStartTime}
              textColor="#000"
              androidVariant="iosClone"
              is24hourSource="locale"
              locale="en-GB"
            />

            <TouchableOpacity
              style={{
                marginTop: 15,
                backgroundColor: '#051b65',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 50
              }}
              onPress={startTimeEdit}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Set Start Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={endTimeEditModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20, paddingTop: 10, alignItems: 'center', elevation: 5, width: 300, position: 'relative' }}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setEndTimeEditModal(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
                padding: 5,
              }}
            >
              <Text style={{ fontSize: 18, color: '#000' }}>✕</Text>
              {/* Or use Icon like Feather name="x" */}
            </TouchableOpacity>

            <DatePicker
              mode="time"
              date={endTime}
              onDateChange={setEndTime}
              minimumDate={startTime}
              textColor="#000"
              androidVariant="iosClone"
              is24hourSource="locale"
              locale="en-GB"
            />
            <TouchableOpacity
              style={{
                marginTop: 15,
                backgroundColor: '#051b65',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 50
              }}
              onPress={endTimeEdit}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Set End Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for niti not done reason text input */}
      <Modal
        visible={niti_notDone_reasonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setNiti_notDone_reasonModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF5722" />
            <Text style={styles.modalTitle}>ନୀତି ନ ହେବାର କାରଣ</Text>
            <Text style={{ fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 10 }}>ଦୟାକରି ଏହି ନୀତି ନ ହେବାର କାରଣ ଲେଖନ୍ତୁ:</Text>
            <View style={{ width: '100%', marginBottom: 20 }}>
              <TextInput
                placeholder="କାରଣ ଲେଖନ୍ତୁ..."
                placeholderTextColor="#999"
                value={niti_notDone_reason}
                onChangeText={text => setNiti_notDone_reason(text)}
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: '#F9F9F9',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 15,
                  paddingHorizontal: 20,
                  paddingVertical: 15,
                  fontSize: 16,
                  color: '#000',
                  textAlignVertical: 'top',
                }}
              />
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => { setNiti_notDone_reasonModal(false); setNiti_notDone_reason(''); }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => notDoneNiti(confirmData)}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Darshan Modal */}
      <Modal
        visible={editDarshanModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditDarshanModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', width: '90%', borderRadius: 10, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>ଦର୍ଶନ ପରିବର୍ତ୍ତନ କରନ୍ତୁ</Text>

            {/* List of darshans with radio buttons */}
            {allDarshan.map((darshan) => (
              <TouchableOpacity
                key={darshan.id}
                onPress={() => setSelectedDarshanId(darshan.id)}
                style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}
              >
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#B7070A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                  {selectedDarshanId === darshan.id && (
                    <View style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                      backgroundColor: '#B7070A',
                    }} />
                  )}
                </View>
                <Text style={{ fontSize: 16 }}>{darshan.darshan_name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setSelectedDarshanId(null)}
              style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}
            >
              <View style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#B7070A',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}>
                {selectedDarshanId === null && (
                  <View style={{
                    height: 10,
                    width: 10,
                    borderRadius: 5,
                    backgroundColor: '#B7070A',
                  }} />
                )}
              </View>
              <Text style={{ fontSize: 16 }}>ଦର୍ଶନ ବନ୍ଦ</Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setEditDarshanModal(false)} style={{ backgroundColor: '#dbd7d7', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginRight: 20 }}>
                <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={editDarshan}
                style={{ backgroundColor: '#B7070A', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal >

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF5722" />
            <Text style={styles.modalTitle}>ନିଶ୍ଚିତ କରନ୍ତୁ</Text>
            <Text style={styles.modalMessage}>
              ଆପଣ ଏହି ନୀତିକୁ <Text style={{ fontWeight: 'bold', color: '#FF5722' }}>{confirmAction}</Text> କରିବାକୁ ଚାହୁଁଛନ୍ତି କି ?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => setConfirmVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmAction}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Yes, Proceed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteSuchanaVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteSuchanaVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF5722" />
            <Text style={styles.modalTitle}>ନିଶ୍ଚିତ କରନ୍ତୁ</Text>
            <Text style={styles.modalMessage}>
              ଆପଣ ଏହି ସୂଚନାକୁ ବିଲୋପ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି ?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => setDeleteSuchanaVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleDeleteSuchana(suchana.id);
                  setDeleteSuchanaVisible(false);
                }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Yes, Proceed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 10 }}>
            {/* Close Icon */}
            <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 10 }} onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close" color="#000" size={28} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#341551', marginBottom: 10, textAlign: 'center' }}>ମହାସ୍ନାନ ନୀତି</Text>

            {/* Special Niti List */}
            <FlatList
              data={otherNiti}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: '#ddd' }}
                  onPress={() => {
                    setSelectedItem(item.id);
                    setOtherNitiText('');
                  }}
                >
                  <FontAwesome
                    name={selectedItem === item.id ? "dot-circle-o" : "circle-o"}
                    color={selectedItem === item.id ? '#B7070A' : '#999'}
                    size={20}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{
                    color: selectedItem === item.id ? '#B7070A' : '#333',
                    fontSize: 16,
                    fontWeight: '500'
                  }}>
                    {item.niti_name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Other Special Niti Input */}
            {/* <TextInput
              placeholder="ଏହିଠାରେ ଲେଖନ୍ତୁ..."
              placeholderTextColor="#888"
              value={otherNitiText}
              onChangeText={text => {
                setOtherNitiText(text);
                if (text.length >= 4) setSelectedItem(null);
              }}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 15, height: 45, marginVertical: 15, fontSize: 16, color: '#000' }}
            /> */}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitOtherNiti}
              disabled={!selectedItem && otherNitiText.trim().length < 4}
              style={{
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor:
                  selectedItem || otherNitiText.trim().length >= 4 ? '#B7070A' : '#ccc'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isOtherNitiModalVisible}
        onRequestClose={() => setIsOtherNitiModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 20, width: '100%', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 }}>
            {/* Header with close */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#341551', flex: 1 }}>ତାଲିକାରେ ନଥିବା ନୀତିକୁ ଯୋଡ଼ନ୍ତୁ।</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsOtherNitiModalVisible(false);
                  setOtherNitiText('');
                  setOtherEngNitiText('');
                  setSuggestions([]);
                  setSelectedFestivalId(null);
                }}
              >
                <Ionicons name="close" color="#000" size={26} />
              </TouchableOpacity>
            </View>

            {/* Festival Niti List (top section) */}
            {festivalNiti && festivalNiti.length > 0 && (
              <View style={{ marginBottom: 14, padding: 10, borderRadius: 12, backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fbbf24' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400e', marginBottom: 6 }}>ପର୍ବ ପର୍ବାଣୀ ନୀତି ତାଲିକା</Text>

                <ScrollView style={{ maxHeight: 160 }}>
                  {festivalNiti.map((item, index) => (
                    <TouchableOpacity
                      key={item.id || index}
                      onPress={() => {
                        setSelectedFestivalId(item.id);
                        // Auto-fill inputs from selected festival
                        setOtherNitiText(item.niti_name || '');
                        setOtherEngNitiText(item.english_niti_name || '');
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        borderBottomWidth:
                          index === festivalNiti.length - 1 ? 0 : 1,
                        borderBottomColor: '#fde68a',
                      }}
                    >
                      <Ionicons
                        name={
                          selectedFestivalId === item.id
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        size={20}
                        color="#B7070A"
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontWeight: '600',
                            fontSize: 14,
                            color: '#111827',
                          }}
                        >
                          {item.niti_name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Odia Niti Input */}
            <Text style={{ fontSize: 16, color: '#333', marginBottom: 6, fontWeight: '600' }}>ଓଡ଼ିଆ ନୀତି</Text>
            <TextInput
              placeholder="ଓଡ଼ିଆ ରେ ଲେଖନ୍ତୁ..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 10,
                fontSize: 14,
                color: '#111827',
                textAlignVertical: 'top',
              }}
              value={otherNitiText}
              onChangeText={(text) => {
                setOtherNitiText(text);
                filterSuggestions(text, false);
                setSelectedFestivalId(null);
              }}
            />

            {/* Suggestion List (you already had this) */}
            {suggestions.length > 0 && (
              <ScrollView
                style={{
                  maxHeight: 170,
                  backgroundColor: '#f1f1f1',
                  marginVertical: 10,
                  borderRadius: 8,
                }}
              >
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestionSelect(item)}
                    style={{
                      padding: 10,
                      borderBottomColor: '#ccc',
                      borderBottomWidth: 1,
                    }}
                  >
                    <Text
                      style={{ fontWeight: '600', fontSize: 15, color: '#000' }}
                    >
                      {item.niti_name}
                    </Text>
                    <Text
                      style={{ fontWeight: '600', fontSize: 15, color: '#000' }}
                    >
                      {item.english_niti_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* English Niti Input */}
            <Text style={{ fontSize: 16, color: '#333', marginBottom: 6, fontWeight: '600' }}>ଇଂରାଜୀ ନୀତି</Text>
            <TextInput
              placeholder="Type in English..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 14,
                fontSize: 14,
                color: '#111827',
                textAlignVertical: 'top',
              }}
              value={otherEngNitiText}
              onChangeText={(text) => {
                setOtherEngNitiText(text);
                filterSuggestions(text, true);
                setSelectedFestivalId(null);
              }}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitOtherNiti}
              disabled={
                otherNitiText.trim().length >= 3 &&
                  otherEngNitiText.trim().length >= 3
                  ? false
                  : true
              }
              style={{
                borderRadius: 999,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor:
                  otherNitiText.trim().length >= 3 &&
                    otherEngNitiText.trim().length >= 3
                    ? '#B7070A'
                    : '#ccc',
              }}
            >
              <Text
                style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}
              >
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isSuchanaModalVisible}
        onRequestClose={() => setIsSuchanaModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 10 }}>
            {/* Close Icon */}
            <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 10 }} onPress={() => setIsSuchanaModalVisible(false)}>
              <Ionicons name="close" color="#000" size={28} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#341551', marginBottom: 10, textAlign: 'center' }}>ନୀତି ସୂଚନା</Text>

            {/* Suchana Input */}
            <Text style={{ fontSize: 16, color: '#333', marginBottom: 10 }}>ଓଡ଼ିଆ ନୀତି ସୂଚନା</Text>
            <TextInput
              placeholder="ଓଡ଼ିଆ ରେ ଲେଖନ୍ତୁ..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              style={styles.input}
              value={suchanaText}
              onChangeText={text => setSuchanaText(text)}
            />

            {/* English Suchana Input */}
            <Text style={{ fontSize: 16, color: '#333', marginBottom: 10 }}>ଇଂରାଜୀ ନୀତି ସୂଚନା</Text>
            <TextInput
              placeholder="Type in English..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              style={styles.input}
              value={suchanaEngText}
              onChangeText={text => setSuchanaEngText(text)}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitSuchana}
              disabled={suchanaText.trim().length >= 3 && suchanaEngText.trim().length >= 3 ? false : true}
              style={{
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor:
                  suchanaText.trim().length >= 3 && suchanaEngText.trim().length >= 3
                    ? '#B7070A'
                    : '#ccc'
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View >
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFBE00'
  },
  headerPart: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#B7070A',
    paddingVertical: 20,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 13,
    elevation: 5
  },
  nitiCell: {
    backgroundColor: '#fff',
    height: 70,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5
  },
  imageContainer: {
    backgroundColor: '#FFBE00',
    height: 250,
    width: '100%'
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  },
  cell: {
    flex: 1,
    marginHorizontal: 10,
    padding: 10,
    borderTopLeftRadius: 20,
    borderBottomEndRadius: 20,
    shadowColor: '#FFBE00',
    shadowOffset: { width: 6, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 9
  },
  smallCell1: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    height: 350,
    alignSelf: 'center',
    top: 250,
    borderRadius: 10,
    padding: 15
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#341551',
    marginTop: 10,
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  rowBack: {
    alignItems: 'flex-end',
    backgroundColor: '#ff3b30',
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 15,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: 80,
    borderRadius: 12,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 15,
    textAlignVertical: 'top'
  },
});
