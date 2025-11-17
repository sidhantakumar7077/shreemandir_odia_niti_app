import { StyleSheet, Text, View, Modal, TouchableWithoutFeedback, TouchableOpacity, Alert, Image, Pressable, TextInput, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Icon from 'react-native-vector-icons/MaterialIcons'

const DrawerModal = ({ visible, onClose }) => {

    const navigation = useNavigation()
    const isFocused = useIsFocused();
    const [userData, setUserData] = useState(null);

    const getUserDataFromLocalStorage = async () => {
        try {
            const userData = await AsyncStorage.getItem('storeUserData');
            if (userData) {
                const parsedData = JSON.parse(userData);
                console.log("User Data", parsedData);
                setUserData(parsedData);
                return parsedData;
            } else {
                console.log("No user data found in local storage");
                return null;
            }
        } catch (error) {
            console.log("Error retrieving user data from local storage", error);
            return null;
        }
    };

    useEffect(() => {
        if (isFocused) {
            getUserDataFromLocalStorage();
        }
    }, [isFocused]);

    return (
        <View>
            <Modal
                visible={visible}
                animationType="none"
                transparent={true}
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={styles.variantModalContainer}>
                            <View style={{ width: '100%', height: 80, backgroundColor: '#B7070A' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: '100%' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ height: 50, width: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                                            <Image style={{ height: 50, width: 50, borderRadius: 25 }} source={require('../assets/images/temple654.jpg')} resizeMode='cover' />
                                        </View>
                                        <View style={{ marginLeft: 10, width: '78%' }}>
                                            {userData?.name ?
                                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff', marginLeft: 10 }}>{userData.name}</Text>
                                                :
                                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff', marginLeft: 10 }}>Puri Panda</Text>
                                            }
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.drawerCell} onPress={() => { navigation.navigate('HundiCollection'), onClose() }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                    <Image style={{ height: 25, width: 25 }} source={require("../assets/images/hundiColection654.png")} />
                                </View>
                                <Text style={styles.drawerLable}>ହୁଣ୍ଡି ସଂଗ୍ରହ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.drawerCell} onPress={() => { navigation.navigate('Notice'), onClose() }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                    <AntDesign name="notification" size={28} color="#FFA726" />
                                </View>
                                <Text style={styles.drawerLable}>ସୂଚନା</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.drawerCell} onPress={() => { navigation.navigate('NitiHistory'), onClose() }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="history" size={28} color="#FFA726" />
                                </View>
                                <Text style={styles.drawerLable}>ଇତିହାସ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.drawerCell, { marginTop: 0 }]}>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.drawerCell, { marginTop: 0 }]}>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.drawerCell, { marginTop: 0 }]}>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.drawerCell, { marginTop: 0 }]}>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.drawerCell, { marginTop: 0 }]}>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.drawerCell, { marginTop: 0 }]}>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.drawerCell, { marginTop: 0 }]}>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.drawerCell, { marginTop: 0 }]}>
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '70%', height: '25%', backgroundColor: '#fff', position: 'absolute', bottom: 0, left: 0 }}>
                            <View style={{ borderTopColor: '#a0a0a0', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-start', paddingBottom: 10 }}>
                                <View style={{ width: '100%', height: 0.5, backgroundColor: '#B7070A', marginBottom: 10 }} />
                                <View style={{ width: '90%', alignSelf: 'center' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#000' }}>Current Version 1.0.1</Text>
                                    {/* <Pressable style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', opacity: 0.7, marginRight: 7 }}>Update Available  2.0</Text>
                                        <Icon name="file-download" size={20} color={'green'} />
                                    </Pressable> */}
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

export default DrawerModal

const styles = StyleSheet.create({
    variantModalContainer: {
        width: '70%',
        height: '75%',
        left: 0,
        top: 0,
        backgroundColor: '#B7070A',
        // bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
    },
    drawerCell: {
        width: '100%',
        height: 58,
        backgroundColor: '#fff',
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        marginTop: 0.6,
    },
    drawerLable: {
        color: '#000',
        fontSize: 20,
        fontWeight: '500',
        letterSpacing: 0.6,
        marginLeft: 15
    }
})