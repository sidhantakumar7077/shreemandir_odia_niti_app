import { StyleSheet, Text, View, TouchableOpacity, TouchableHighlight, Image, FlatList, ScrollView, Switch, Modal, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import DrawerModal from '../../Components/DrawerModal';

const Index = () => {

    const initialMahaprasad = [
        {
            id: 1,
            name: 'Sakala Dhoopa',
            startTime: '',
            endTime: '',
            startDisabled: false,
            stopDisabled: false,
            elapsedTime: 0,
            totalDuration: 0
        },
        {
            id: 2,
            name: 'Madhyana Dhoopa',
            startTime: '',
            endTime: '',
            startDisabled: false,
            stopDisabled: false,
            elapsedTime: 0,
            totalDuration: 0
        },
        {
            id: 3,
            name: 'Sandhya Dhoopa',
            startTime: '',
            endTime: '',
            startDisabled: false,
            stopDisabled: false,
            elapsedTime: 0,
            totalDuration: 0
        },
        {
            id: 4,
            name: 'Bada Singhara Dhoopa',
            startTime: '',
            endTime: '',
            startDisabled: false,
            stopDisabled: false,
            elapsedTime: 0,
            totalDuration: 0
        },
    ];

    const specialMahaprasad = [
        {
            id: 101,
            name: 'Pahili Bhog',
            startTime: '',
            endTime: '',
            startDisabled: false,
            stopDisabled: false,
            elapsedTime: 0,
            totalDuration: 0
        },
    ];

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const closeDrawer = () => { setIsDrawerOpen(false); };
    const [activeTab, setActiveTab] = useState('upcoming');
    const [dailyMahaprasad, setDailyMahaprasad] = useState(initialMahaprasad);
    const [activeIndex, setActiveIndex] = useState(0);
    const [timers, setTimers] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [otherMahaprasadName, setOtherMahaprasadName] = useState('');
    const navigation = useNavigation();

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleSubmit = () => {
        console.log("Selected Item:", selectedItem);
        setIsModalVisible(false);
        setSelectedItem(null);
        setDailyMahaprasad((prv) => (([{ special_mahaprasad: true, ...selectedItem }, ...prv])));
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setDailyMahaprasad(prevMahaprasad =>
                prevMahaprasad.map(item => {
                    if (item.startDisabled && !item.stopDisabled && !item.isPaused) {
                        const elapsed = (Date.now() - item.startTimestamp) / 1000;
                        return { ...item, elapsedTime: Math.round(elapsed) };
                    }
                    return item;
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleStart = id => {
        const startTimestamp = Date.now();
        setDailyMahaprasad(prevMahaprasad =>
            prevMahaprasad.map(item =>
                item.id === id
                    ? { ...item, startTimestamp, startDisabled: true, stopDisabled: false, startTime: new Date(startTimestamp).toLocaleTimeString(), isPaused: false }
                    : item
            )
        );
    };

    const handleStop = id => {
        const endTimestamp = Date.now();
        const endTime = new Date(endTimestamp).toLocaleTimeString();
        setDailyMahaprasad(prevMahaprasad =>
            prevMahaprasad.map(item =>
                item.id === id
                    ? {
                        ...item,
                        endTime,
                        endTimestamp,
                        stopDisabled: true,
                        totalDuration: Math.round((endTimestamp - item.startTimestamp) / 1000)
                    }
                    : item
            )
        );
        clearInterval(timers[id]);
    };

    const handlePause = id => {
        setDailyMahaprasad(prevMahaprasad =>
            prevMahaprasad.map(item =>
                item.id === id ? { ...item, isPaused: true } : item
            )
        );
        setIsModalVisible(true);
        clearInterval(timers[id]);
    };

    const handleResume = id => {
        const resumeTimestamp = Date.now();
        setDailyMahaprasad(prevMahaprasad =>
            prevMahaprasad.map(item =>
                item.id === id ? { ...item, startTimestamp: resumeTimestamp - item.elapsedTime * 1000, isPaused: false } : item
            )
        );
    };

    const formatElapsedTime = seconds => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const upcomingMahaprasad = dailyMahaprasad.filter(item => !item.endTime);
    const completedMahaprasad = dailyMahaprasad.filter(item => item.endTime);

    return (
        <View style={{ flex: 1, backgroundColor: '#FFBE00', opacity: isModalVisible ? 0.8 : 1 }}>
            <DrawerModal visible={isDrawerOpen} navigation={navigation} onClose={closeDrawer} />
            <View style={styles.headerPart}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={{ marginHorizontal: 10 }}>
                        <FontAwesome5 name="bars" size={23} color="#fff" />
                    </TouchableOpacity>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Maha Prasad</Text>
                </View>
                <View style={{ marginRight: 10 }}>
                    <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ backgroundColor: 'green', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>Special Niti</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.imageContainer}>
                <Image source={require('../../assets/images/3rathas.jpg')} style={styles.image} />
            </View>
            <View style={{ backgroundColor: '#FFBE00', paddingTop: 1 }}>
                <View style={{ backgroundColor: '#B7070A', paddingVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{moment().format("MMMM Do YYYY, dddd")}</Text>
                </View>
            </View>
            <View style={{ backgroundColor: '#FFBE00', width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setActiveTab('upcoming')} style={{ width: '50%', alignItems: 'center', padding: 10 }}>
                    <Text style={{ color: activeTab === 'upcoming' ? '#B7070A' : '#444545', fontSize: activeTab === 'upcoming' ? 16 : 15, fontWeight: 'bold' }}>Upcoming MahaPrasad</Text>
                    <View style={{ backgroundColor: activeTab === 'upcoming' ? '#B7070A' : '#444545', width: '100%', height: activeTab === 'upcoming' ? 2 : 1, marginTop: 5 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('complete')} style={{ width: '50%', alignItems: 'center', padding: 10 }}>
                    <Text style={{ color: activeTab === 'complete' ? '#B7070A' : '#444545', fontSize: activeTab === 'complete' ? 16 : 15, fontWeight: 'bold' }}>Completed MahaPrasad</Text>
                    <View style={{ backgroundColor: activeTab === 'complete' ? '#B7070A' : '#444545', width: '100%', height: activeTab === 'complete' ? 2 : 1, marginTop: 5 }} />
                </TouchableOpacity>
            </View>
            {activeTab === 'upcoming' ? (
                <ScrollView style={styles.cell}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                        data={upcomingMahaprasad}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.smallCell1}>
                                <View style={{ width: '60%' }}>
                                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                                    {item.startTime && (
                                        <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>
                                            Start Time: {item.startTime}
                                        </Text>
                                    )}
                                    {item.endTime && (
                                        <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>
                                            End Time: {item.endTime}
                                        </Text>
                                    )}
                                    {item.startDisabled && !item.stopDisabled && (
                                        <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>
                                            Running Time: {formatElapsedTime(item.elapsedTime)}
                                        </Text>
                                    )}
                                </View>
                                {index === activeIndex ? (
                                    item.startDisabled ? (
                                        <View style={{ width: '40%', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>
                                            {item.isPaused ? (
                                                <TouchableOpacity
                                                    style={{ backgroundColor: '#11dcf2', paddingVertical: 7, paddingHorizontal: 7, borderRadius: 5 }}
                                                    onPress={() => handleResume(item.id)}
                                                >
                                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Resume</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                !item.special_mahaprasad &&
                                                <TouchableOpacity
                                                    style={{ backgroundColor: '#11dcf2', paddingVertical: 7, paddingHorizontal: 7, borderRadius: 5 }}
                                                    onPress={() => handlePause(item.id)}
                                                >
                                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Pause</Text>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                style={{ backgroundColor: 'red', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 5 }}
                                                onPress={() => handleStop(item.id)}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Stop</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={{ width: '40%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                            <TouchableOpacity
                                                style={{ backgroundColor: 'green', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 5 }}
                                                onPress={() => handleStart(item.id)}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Start</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                ) : (
                                    <View style={{ width: '40%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                        <TouchableOpacity
                                            style={{ backgroundColor: 'gray', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 5 }}
                                            disabled
                                        >
                                            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Start</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    />
                </ScrollView>
            ) : (
                <ScrollView style={styles.cell}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={completedMahaprasad.reverse()}
                        scrollEnabled={false}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.smallCell1}>
                                <View style={{ width: '60%' }}>
                                    <Text style={{ color: '#000', fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>
                                        Start Time: {item.startTime}
                                    </Text>
                                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '400' }}>
                                        End Time: {item.endTime}
                                    </Text>
                                </View>
                                <View style={{ width: '40%', alignItems: 'center' }}>
                                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Total Duration</Text>
                                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>
                                        {formatElapsedTime(item.totalDuration)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />
                </ScrollView>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(!isModalVisible)}
            >
                <View style={styles.modalContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#000', fontSize: 20, fontWeight: '600' }}>Select Special Maha Prasad</Text>
                        <TouchableOpacity style={{ alignItems: 'flex-end' }} onPress={() => { setIsModalVisible(false); }}>
                            <Ionicons name="close" color={'#000'} size={30} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-start', marginTop: 10 }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={specialMahaprasad}
                            scrollEnabled={false}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}
                                    onPress={() => handleSelectItem(item)}
                                >
                                    <FontAwesome
                                        name={selectedItem?.id === item.id ? "dot-circle-o" : "circle-o"}
                                        color={selectedItem?.id === item.id ? '#B7070A' : '#000'}
                                        size={20}
                                        marginRight={7}
                                    />
                                    <View style={{ width: '70%', flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: '#000', fontSize: 17, fontWeight: '500' }}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Maha Prasad name"
                            placeholderTextColor="#aaa"
                            value={otherMahaprasadName}
                            onChangeText={setOtherMahaprasadName}
                        />
                        {selectedItem ?
                            <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: 'red', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 5 }}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Submit</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity disabled style={{ backgroundColor: 'gray', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 5 }}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Submit</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </Modal>

            <View style={{ padding: 0, height: 58, borderRadius: 0, backgroundColor: '#f2ebe4', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', margin: 0, paddingBottom: 5 }}>
                    <View style={{ padding: 0, width: '30%' }}>
                        <TouchableHighlight onPressIn={() => navigation.navigate('Home')} underlayColor="#DDDDDD" style={{ backgroundColor: '#f2ebe4', flexDirection: 'column', alignItems: 'center' }}>
                            <View style={{ alignItems: 'center' }}>
                                <Image source={require('../../assets/images/panji765.png')} style={{ width: 24, height: 24, tintColor: 'gray', marginTop: 12 }} />
                                <Text style={{ color: 'gray', fontSize: 11, fontWeight: '500', height: 17 }}>Niti</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={{ padding: 0, width: '30%' }}>
                        <TouchableHighlight onPressIn={() => navigation.navigate('Darshan')} underlayColor="#DDDDDD" style={{ backgroundColor: '#f2ebe4', flexDirection: 'column', alignItems: 'center' }}>
                            <View style={{ alignItems: 'center' }}>
                                <Image source={require('../../assets/images/darshan.png')} style={{ width: 32, height: 32, tintColor: 'gray', marginTop: 6, }} />
                                <Text style={{ color: 'gray', fontSize: 11, fontWeight: '500', height: 17 }}>Darshan</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    <View style={{ padding: 0, width: '30%' }}>
                        <View activeOpacity={0.6} underlayColor="#DDDDDD" style={{ backgroundColor: '#f2ebe4', flexDirection: 'column', alignItems: 'center' }}>
                            <View style={{ alignItems: 'center', marginTop: 3 }}>
                                <Image source={require('../../assets/images/mahaprasadad32412.png')} style={{ width: 34, height: 34 }} />
                                <Text style={{ color: '#dc3545', fontSize: 11, fontWeight: '500', height: 17 }}>Maha Prasad</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
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
        paddingVertical: 13,
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
        marginBottom: 15,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5
    },
    modalContainer: {
        backgroundColor: '#fff',
        width: '90%',
        height: 240,
        alignSelf: 'center',
        top: 250,
        borderRadius: 10,
        padding: 15
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 18,
        marginBottom: 28,
        backgroundColor: '#fff',
        color: '#333',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
});
