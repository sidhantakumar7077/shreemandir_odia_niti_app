import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../../App';

const OtpVerify = (props) => {

    const navigation = useNavigation();
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (otp.length === 6) {
            handleOtpVerification();
        }
    }, [otp]);

    const handleOtpVerification = async () => {
        setIsLoading(true);

        try {
            if (otp === "" || otp.length != 6) {
                setErrorMessage('ଦୟାକରି ଏକ ବୈଧ ଓଟିପି ଦିଅନ୍ତୁ');
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                }, 5000);
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('orderId', props.route.params.order_id);
            formData.append('otp', otp);
            formData.append('phoneNumber', props.route.params.phone);

            // console.log("formData", formData);
            // return;

            const response = await fetch(base_url + "api/admin/verify-otp", {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Login successfully', data);
                await AsyncStorage.setItem('storeAccesstoken', data.token);
                navigation.replace('Home');
            } else {
                // Handle error response
                console.log("Error while sending OTP", data);
                setErrorMessage(data.message || 'ଲଗଇନ୍ କରିବାରେ ବିଫଳ| ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ|');
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                }, 5000);
            }
        } catch (error) {
            setErrorMessage('ଲଗଇନ୍ କରିବାରେ ବିଫଳ| ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ|');
            setShowError(true);
            console.log("Error-=-=", error);
            setTimeout(() => {
                setShowError(false);
            }, 5000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground source={require('./../../assets/images/ratha.jpeg')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Text style={styles.title}>ଓଟିପି ଯାଞ୍ଚକରଣ</Text>
                <Text style={styles.subTitle}>ଫୋନକୁ ପଠାଯାଇଥିବା ଓଟିପି ଦିଅନ୍ତୁ।</Text>

                <TextInput
                    style={styles.input}
                    placeholder="ଓଟିପି ଦିଅନ୍ତୁ"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                    maxLength={6}
                    value={otp}
                    onChangeText={(text) => setOtp(text)}
                />
                {showError && <Text style={styles.errorText}>{errorMessage}</Text>}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#c80100" />
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleOtpVerification}>
                        <Text style={styles.buttonText}>Verify OTP</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
        padding: 20,
        borderRadius: 20,
        width: '90%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subTitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 18,
        marginBottom: 20,
        backgroundColor: '#fff',
        color: '#333',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3, // Adds a soft shadow effect for Android
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 5, // Shadow effect for Android
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        marginBottom: 15,
        fontSize: 14,
    },
});

export default OtpVerify;
