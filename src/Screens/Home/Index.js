import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView, Modal, TextInput, ToastAndroid, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { base_url } from '../../../App';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import DrawerModal from '../../Components/DrawerModal';
import NoticeBanner from '../../Components/NoticeBanner';

const Index = () => {

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalVisible, setIsModalVisible] = useState(false);
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
      getNotice();
      console.log("Refreshing Successful");
    }, 2000);
  }, []);

  const [spinner, setSpinner] = useState(false);
  const [allNiti, setAllNiti] = useState([]);
  const [completedNiti, setCompletedNiti] = useState([]);
  const [otherNiti, setOtherNiti] = useState([]);
  const [otherNitiText, setOtherNitiText] = useState('');
  const [runningTimers, setRunningTimers] = useState({});

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

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const showConfirmation = (actionType, data) => {
    setConfirmAction(actionType);
    setConfirmData(data);
    setConfirmVisible(true);
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'start') startNiti(confirmData);
    // if (confirmAction === 'pause') pauseNiti(confirmData);
    if (confirmAction === 'pause') setIsModalVisible(true);
    if (confirmAction === 'resume') resumeNiti(confirmData);
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
        // console.log("All Niti", responseData.data);
      }
    } catch (error) {
      console.log(error);
      setSpinner(false);
    }
  };

  const getOtherNiti = async () => {
    try {
      const response = await fetch(base_url + 'api/other-niti', {
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
        console.log("Error", responseData);
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
        console.log("Niti started successfully", responseData);
      } else {
        getAllNiti();
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
        console.log("Niti paused successfully", responseData);
      } else {
        getAllNiti();
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
        console.log("Niti resumed successfully", responseData);
      } else {
        getAllNiti();
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
        console.log("Niti stopped successfully", responseData);
      } else {
        getAllNiti();
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitOtherNiti = async () => {
    pauseNiti(confirmData);
    const token = await AsyncStorage.getItem('storeAccesstoken');
    const selectedNiti = otherNiti.find(item => item.id === selectedItem);
    const payload = {
      niti_name: selectedNiti?.niti_name || otherNitiText,
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
        console.log('Special Niti saved:', data);
        ToastAndroid.show('Special Niti added successfully', ToastAndroid.SHORT);
        setIsModalVisible(false);
        setSelectedItem(null);
        setOtherNitiText('');
        getOtherNiti();
        getAllNiti();
      } else {
        ToastAndroid.show(data.message || 'Failed to add special Niti', ToastAndroid.SHORT);
        console.log("Error", data.message || 'Failed to add special Niti');
      }
    } catch (error) {
      console.log('Error saving special Niti:', error);
      ToastAndroid.show('Error saving special Niti', ToastAndroid.SHORT);
    }
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
        console.log("Other Niti deleted successfully", responseData);
        ToastAndroid.show('Other Niti deleted successfully', ToastAndroid.SHORT);
      } else {
        getAllNiti();
        getCompletedNiti();
        console.log("Error", responseData);
        ToastAndroid.show('Error deleting Other Niti', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Error", error);
      ToastAndroid.show('Error deleting Other Niti', ToastAndroid.SHORT);
    }
  };

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
        // console.log("Notice", responseData.data);
        setNotice(responseData.data[0]);
      } else {
        console.log("Error", responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getAllNiti();
      getCompletedNiti();
      getOtherNiti();
      getNotice();
    }
  }, [isFocused]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFBE00', opacity: isModalVisible && isDrawerOpen ? 0.8 : 1 }}>
      <DrawerModal visible={isDrawerOpen} navigation={navigation} onClose={closeDrawer} />
      {/* Header Section */}
      <View style={styles.headerPart}>
        <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={{ marginHorizontal: 10 }}>
            <FontAwesome5 name="bars" size={23} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>ଦୈନିକ ନୀତି</Text>
        </TouchableOpacity>
        <View style={{ marginRight: 10 }}>
          <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ backgroundColor: 'green', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 1 }}>ବିଶେଷ ନୀତି</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Notice Banner */}
        {notice && notice.notice_name &&
          <NoticeBanner noticeText={notice.notice_name} />
        }
        {/* Running Niti or previous Niti */}
        {(allNiti.some(niti => niti.niti_status === "Started") || completedNiti.length > 0) && (
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
              {/* Niti Info */}
              <View style={{ width: '75%' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#341551' }}>
                  {
                    allNiti.find(n => n.niti_status === "Started")?.niti_name ??
                    completedNiti[completedNiti.length - 1]?.niti_name ??
                    "No Niti"
                  }
                </Text>
                {/* Red underline */}
                <View style={{ backgroundColor: '#fa0000', width: 80, height: 1.5, marginVertical: 8 }} />
                {/* Date and Time Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                  {/* Date */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={16} color="#fa0000" />
                    <Text style={{ color: '#979998', fontWeight: '500', marginLeft: 5 }}>
                      {moment().format("Do MMMM")}
                    </Text>
                  </View>
                  {/* Start Time */}
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
                {/* Running Time */}
                {allNiti.find(n => n.niti_status === "Started") && (
                  <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', marginTop: 8 }}>
                    ⏱️ ନୀତି ଚାଲିଥିବା ସମୟ: <Text style={{ color: '#fa0000' }}>{runningTimers[allNiti.find(n => n.niti_status === "Started")?.niti_id] || '00:00:00'}</Text>
                  </Text>
                )}
              </View>
              {/* Badge & Arrow */}
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
                {/* <Ionicons name="chevron-forward" size={24} color="#fa0000" /> */}
              </View>
            </View>
          </View>
        )}
        {/* Today Date */}
        <View style={{ backgroundColor: '#FFBE00' }}>
          <View style={{ backgroundColor: '#B7070A', paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{moment().format("MMMM Do YYYY, dddd")}</Text>
          </View>
        </View>
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
            <FlatList
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              data={allNiti}
              keyExtractor={item => item.niti_id}
              renderItem={({ item, index }) => (
                <View style={styles.smallCell1}>
                  <TouchableOpacity onPress={() => collapseSubNiti(item.niti_id)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ width: '60%' }}>
                      {item.niti_status === "Upcoming" ? (
                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', textTransform: 'capitalize' }}>
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
                      {item.niti_status === "Upcoming" && index === 0 &&
                        <TouchableOpacity
                          style={{
                            backgroundColor: index === 0 ? 'green' : '#ccc',
                            paddingVertical: 7,
                            paddingHorizontal: 10,
                            borderRadius: 5,
                          }}
                          disabled={index !== 0}
                          onPress={() => showConfirmation('start', item.niti_id)}
                        >
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Start</Text>
                        </TouchableOpacity>
                      }
                      {index === 0 ? (
                        <>
                          {(item.niti_status === "Started" || item.niti_status === "Paused") &&
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                              {item.niti_type === "other" ? (
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: '#B7070A',
                                    paddingVertical: 7,
                                    paddingHorizontal: 10,
                                    borderRadius: 5
                                  }}
                                  onPress={() => showConfirmation('stop', item.niti_id)}
                                >
                                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Stop</Text>
                                </TouchableOpacity>
                              ) : (
                                <>
                                  {item.niti_status === 'Paused' ? (
                                    <TouchableOpacity
                                      style={{
                                        backgroundColor: '#11dcf2',
                                        paddingVertical: 7,
                                        paddingHorizontal: 7,
                                        borderRadius: 5
                                      }}
                                      onPress={() => showConfirmation('resume', item.niti_id)}
                                    >
                                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Resume</Text>
                                    </TouchableOpacity>
                                  ) : (
                                    <TouchableOpacity
                                      style={{
                                        backgroundColor: '#11dcf2',
                                        paddingVertical: 7,
                                        paddingHorizontal: 7,
                                        borderRadius: 5
                                      }}
                                      onPress={() => showConfirmation('pause', item.niti_id)}
                                    >
                                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Pause</Text>
                                    </TouchableOpacity>
                                  )}
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor: '#B7070A',
                                      paddingVertical: 7,
                                      paddingHorizontal: 10,
                                      borderRadius: 5
                                    }}
                                    onPress={() => showConfirmation('stop', item.niti_id)}
                                  >
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Stop</Text>
                                  </TouchableOpacity>
                                </>
                              )}
                              {item.niti_type === "other" && item.status === "active" &&
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: '#B7070A',
                                    paddingVertical: 7,
                                    paddingHorizontal: 10,
                                    borderRadius: 5
                                  }}
                                  onPress={() => showConfirmation('delete', item.niti_id)}
                                >
                                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Delete</Text>
                                </TouchableOpacity>
                              }
                            </View>
                          }
                        </>
                      ) : (
                        <TouchableOpacity
                          style={{
                            backgroundColor: index === 0 ? 'green' : '#ccc',
                            paddingVertical: 7,
                            paddingHorizontal: 10,
                            borderRadius: 5,
                          }}
                          disabled={index !== 0}
                          onPress={() => showConfirmation('start', item.niti_id)}
                        >
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Start</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
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
            />
            {allNiti.length === 0 && (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#B7070A',
                    paddingVertical: 12,
                    paddingHorizontal: 30,
                    borderRadius: 8,
                    elevation: 3
                  }}
                  onPress={() => endNiti()}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>End of Niti</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.cell}>
            <FlatList
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              data={[...completedNiti].reverse()}
              keyExtractor={(item, index) => `main-${item.niti_id}-${index}`}
              renderItem={({ item }) => (
                <View style={[styles.smallCell1, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                  <View style={{ width: '60%' }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', textTransform: 'capitalize' }}>{item.niti_name}</Text>
                    <Text style={{ color: '#000', fontSize: 12, fontWeight: '400' }}>ଆରମ୍ଭ ସମୟ: {moment(item.start_time, "HH:mm:ss").format("HH:mm:ss")}</Text>
                    <Text style={{ color: '#000', fontSize: 12, fontWeight: '400' }}>ବନ୍ଦ ସମୟ: {moment(item.end_time, "HH:mm:ss").format("HH:mm:ss")}</Text>
                    {(() => {
                      const start = moment(item.start_time, "HH:mm:ss");
                      let end = moment(item.end_time, "HH:mm:ss");

                      if (end.isBefore(start)) {
                        end.add(1, 'day'); // Add 1 day if end is before start
                      }

                      const duration = moment.duration(end.diff(start));

                      const hours = String(duration.hours()).padStart(2, '0');
                      const minutes = String(duration.minutes()).padStart(2, '0');
                      const seconds = String(duration.seconds()).padStart(2, '0');

                      return (
                        <Text style={{ color: '#000', fontSize: 12, fontWeight: '400' }}>
                          ମୋଟ ଅବଧି: {hours}:{minutes}:{seconds}
                        </Text>
                      );
                    })()}
                    {/* <Text style={{ color: '#000', fontSize: 12, fontWeight: '400' }}>Total Duration: {moment.duration(moment(item.end_time, "HH:mm:ss").diff(moment(item.start_time, "HH:mm:ss"))).humanize()}</Text> */}
                  </View>
                  <View style={{ width: '40%', alignItems: 'center' }}>
                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଛି</Text>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>

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
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#341551', marginBottom: 10, textAlign: 'center' }}>ତାଲିକାରେ ନଥିବା ନୀତିକୁ ଯୋଡ଼ନ୍ତୁ।</Text>

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
            <TextInput
              placeholder="ଏହିଠାରେ ଲେଖନ୍ତୁ..."
              placeholderTextColor="#888"
              value={otherNitiText}
              onChangeText={text => {
                setOtherNitiText(text);
                if (text.length >= 4) setSelectedItem(null);
              }}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 15, height: 45, marginVertical: 15, fontSize: 16, color: '#000' }}
            />

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
    </View>
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
});
