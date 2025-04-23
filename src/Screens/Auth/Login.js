import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { base_url } from '../../../App';

const Login = () => {
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (phoneNumber.length === 10) {
            handleLogin();
        }
    }, [phoneNumber]);

    const handleLogin = async () => {
        setIsLoading(true);
        // navigation.navigate('OtpVerify');
        // return;

        try {
            const phoneRegex = /^\d{10}$/; // Regex to match a 10-digit phone number
            if (phoneNumber.length !== 10 || !phoneRegex.test(phoneNumber)) {
                setErrorMessage('ଦୟାକରି ଏକ ବୈଧ ୧୦ ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ।');
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                }, 15000);
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('phone', phoneNumber);

            const response = await fetch(base_url + 'api/admin/send-otp', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                console.log('OTP sent successfully', data);
                let phone_orderId = {
                    phone: data.phone,
                    order_id: data.order_id
                }
                navigation.navigate('OtpVerify', phone_orderId);
            } else {
                // Handle error response
                console.log("Error while sending OTP", data);
                setErrorMessage(data.message || 'ଓଟିପି ପଠାଇବାରେ ବିଫଳ | ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ |');
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                }, 5000);
            }
        } catch (error) {
            setErrorMessage('ଓଟିପି ପଠାଇବାରେ ବିଫଳ | ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ |');
            setShowError(true);
            console.log("Error", error);
            setTimeout(() => {
                setShowError(false);
            }, 5000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ImageBackground source={require('./../../assets/images/ratha.jpeg')} style={styles.backgroundImage}>
            {/* Overlay with opacity */}
            <View style={styles.overlay} />
            <View style={styles.container}>
                <Text style={styles.title}>ଜୟ ଜଗନ୍ନାଥ</Text>
                <Text style={styles.subTitle}>ପଞ୍ଜିକୃତ ଫୋନ୍ ନମ୍ବର ସହିତ ଲଗଇନ୍ କରନ୍ତୁ।</Text>

                <TextInput
                    style={styles.input}
                    placeholder="ଏଠାରେ ଫୋନ୍ ନମ୍ବର ଦିଅନ୍ତୁ"
                    placeholderTextColor="#aaa"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={(text) => setPhoneNumber(text)}
                />
                {showError && <Text style={styles.errorText}>{errorMessage}</Text>}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#c80100" />
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Continue</Text>
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Black with 40% opacity
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

export default Login;
