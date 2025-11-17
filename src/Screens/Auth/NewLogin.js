import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { base_url } from '../../../App';

const LoginWithOtp = () => {

    const navigation = useNavigation();
    const [step, setStep] = useState(1); // 1 = phone, 2 = OTP
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-submit when length is complete (optional)
    useEffect(() => {
        if (phoneNumber.length === 10 && step === 1) {
            handleSendOtp();
        }
    }, [phoneNumber]);

    useEffect(() => {
        if (otp.length === 6 && step === 2) {
            handleVerifyOtp();
        }
    }, [otp]);

    const showErrorMessage = (msg, duration = 5000) => {
        setErrorMessage(msg);
        setShowError(true);
        setTimeout(() => {
            setShowError(false);
        }, duration);
    };

    const handleSendOtp = async () => {
        const phoneRegex = /^\d{10}$/;

        if (phoneNumber.length !== 10 || !phoneRegex.test(phoneNumber)) {
            showErrorMessage(
                'ଦୟାକରି ଏକ ବୈଧ ୧୦ ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ।',
                15000
            );
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(base_url + 'api/admin/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ phone: phoneNumber }),
            });

            const data = await response.json();
            console.log('send-otp response =>', data);

            if (response.ok && data.success) {
                // success: true from your Postman screenshot
                setStep(2);
            } else {
                console.log('Error while sending OTP', data);
                showErrorMessage(
                    data.message ||
                    'ଓଟିପି ପଠାଇବାରେ ବିଫଳ | ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ |'
                );
            }
        } catch (error) {
            console.log('Error', error);
            showErrorMessage(
                'ଓଟିପି ପଠାଇବାରେ ବିଫଳ | ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ |'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp === '' || otp.length !== 6) {
            showErrorMessage('ଦୟାକରି ଏକ ବୈଧ ଓଟିପି ଦିଅନ୍ତୁ');
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(base_url + 'api/admin/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    otp: otp,
                }),
            });

            const data = await response.json();
            console.log('verify-otp response =>', data);

            // From your screenshot verifyOtp returns: message, token, token_type, user
            if (response.ok && data.token) {
                console.log('Login successfully', data);
                await AsyncStorage.setItem('storeAccesstoken', data.token);
                await AsyncStorage.setItem('storeUserData', JSON.stringify(data.user));
                navigation.replace('Home');
            } else {
                console.log('Error while verifying OTP', data);
                showErrorMessage(
                    data.message ||
                    'ଲଗଇନ୍ କରିବାରେ ବିଫଳ| ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ|'
                );
            }
        } catch (error) {
            console.log('Error-=-=', error);
            showErrorMessage(
                'ଲଗଇନ୍ କରିବାରେ ବିଫଳ| ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ|'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepHeader = () => (
        <View style={styles.stepHeader}>
            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>
                        1
                    </Text>
                </View>
                <Text
                    style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}
                >
                    ଫୋନ୍ ନମ୍ବର
                </Text>
            </View>

            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
                <View style={[styles.stepCircle, step === 2 && styles.stepCircleActive]}>
                    <Text style={[styles.stepNumber, step === 2 && styles.stepNumberActive]}>
                        2
                    </Text>
                </View>
                <Text
                    style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}
                >
                    ଓଟିପି ଯାଞ୍ଚ
                </Text>
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={['#B7070A', '#FFBE00', '#FFBE00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.background}
        >
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.card}>
                    {/* Spiritual header */}
                    <Text style={styles.headerChant}>🔱 ଭକ୍ତ ପୋର୍ଟାଲ୍ 🔱</Text>
                    <Text style={styles.mainTitle}>ଜୟ ଜଗନ୍ନାଥ</Text>
                    <Text style={styles.subTitle}>
                        {step === 1
                            ? 'ପଞ୍ଜିକୃତ ଫୋନ୍ ନମ୍ବର ସହିତ ଆପଣଙ୍କ ଦିବ୍ୟ ଖାତାକୁ ପ୍ରବେଶ କରନ୍ତୁ।'
                            : 'ଆପଣଙ୍କ ଫୋନକୁ ପଠାଯାଇଥିବା ଓଟିପି ଦିଅନ୍ତୁ ଏବଂ ପ୍ରବେଶ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ।'}
                    </Text>

                    {renderStepHeader()}

                    {step === 1 ? (
                        <>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Mobile Number</Text>
                                <View style={styles.phoneRow}>
                                    <View style={styles.countryCode}>
                                        <Text style={styles.countryCodeText}>+91</Text>
                                    </View>
                                    <TextInput
                                        style={styles.phoneInput}
                                        placeholder="ଏଠାରେ ଫୋନ୍ ନମ୍ବର ଦିଅନ୍ତୁ"
                                        placeholderTextColor="#C4A484"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                    />
                                </View>
                            </View>

                            {showError && <Text style={styles.errorText}>{errorMessage}</Text>}

                            {isLoading ? (
                                <ActivityIndicator size="large" color="#ea580c" />
                            ) : (
                                <TouchableOpacity
                                    style={styles.buttonWrapper}
                                    onPress={handleSendOtp}
                                >
                                    <LinearGradient
                                        colors={['#f97316', '#facc15']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.button}
                                    >
                                        <Text style={styles.buttonText}>Send OTP</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}

                            <Text style={styles.footerHint}>
                                ଆପଣଙ୍କ ନମ୍ବର କେବଳ ଯାଞ୍ଚ ପାଇଁ ଅପରିହାର୍ଯ୍ୟ ଭାବେ ବ୍ୟବହାରିତ ହେବ।
                            </Text>
                        </>
                    ) : (
                        <>
                            {/* Change phone option */}
                            <View style={styles.changeRow}>
                                <Text style={styles.infoMini}>
                                    ଓଟିପି ପଠାଯାଇଛି +91-{phoneNumber}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setStep(1);
                                        setOtp('');
                                    }}
                                >
                                    <Text style={styles.changePhoneText}>ନମ୍ବର ପରିବର୍ତ୍ତନ କରନ୍ତୁ</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Enter OTP</Text>
                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="••••••"
                                    placeholderTextColor="#D1A86E"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                />
                            </View>

                            {showError && <Text style={styles.errorText}>{errorMessage}</Text>}

                            {isLoading ? (
                                <ActivityIndicator size="large" color="#ea580c" />
                            ) : (
                                <TouchableOpacity
                                    style={styles.buttonWrapper}
                                    onPress={handleVerifyOtp}
                                >
                                    <LinearGradient
                                        colors={['#f97316', '#facc15']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.button}
                                    >
                                        <Text style={styles.buttonText}>Verify & Enter</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleSendOtp}
                            >
                                <Text style={styles.secondaryButtonText}>Resend OTP</Text>
                            </TouchableOpacity>

                            <Text style={styles.footerChant}>
                                "ଜଗନ୍ନାଥ ସ୍ୱାମୀ ନୟନ ପଥଗାମୀ ଭବତୁ ମେ"
                            </Text>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    flex: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: 'rgba(255, 250, 240, 0.96)',
        borderRadius: 24,
        paddingVertical: 26,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.35,
        shadowRadius: 30,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    headerChant: {
        textAlign: 'center',
        fontSize: 12,
        color: '#78350f',
        marginBottom: 6,
        letterSpacing: 1,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#7c2d12',
        textAlign: 'center',
        marginBottom: 4,
    },
    subTitle: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 18,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    stepCircleActive: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    stepNumber: {
        fontSize: 13,
        color: '#9ca3af',
        fontWeight: '600',
    },
    stepNumberActive: {
        color: '#b45309',
    },
    stepLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 4,
    },
    stepLabelActive: {
        color: '#b45309',
        fontWeight: '600',
    },
    stepLine: {
        width: 60,
        height: 2,
        marginHorizontal: 10,
        borderRadius: 999,
        backgroundColor: 'rgba(249, 115, 22, 0.35)',
    },
    inputWrapper: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 6,
        fontWeight: '500',
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryCode: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fef3c7',
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    countryCodeText: {
        fontSize: 15,
        color: '#92400e',
        fontWeight: '700',
    },
    phoneInput: {
        flex: 1,
        height: 50,
        borderColor: '#fbbf24',
        borderWidth: 1,
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
        paddingHorizontal: 14,
        fontSize: 16,
        backgroundColor: '#fdfcf3',
        color: '#111827',
    },
    otpInput: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fbbf24',
        backgroundColor: '#fefce8',
        fontSize: 20,
        textAlign: 'center',
        letterSpacing: 4,
        color: '#7c2d12',
    },
    buttonWrapper: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    button: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 17,
        color: '#451a03',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        marginTop: 10,
        alignSelf: 'center',
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    secondaryButtonText: {
        fontSize: 14,
        color: '#b45309',
        fontWeight: '500',
    },
    changeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoMini: {
        fontSize: 12,
        color: '#92400e',
    },
    changePhoneText: {
        fontSize: 12,
        color: '#b91c1c',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    errorText: {
        color: '#b91c1c',
        marginTop: 6,
        fontSize: 13,
        textAlign: 'center',
    },
    footerHint: {
        marginTop: 10,
        fontSize: 11,
        color: '#9ca3af',
        textAlign: 'center',
    },
    footerChant: {
        marginTop: 12,
        fontSize: 12,
        color: '#7c2d12',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default LoginWithOtp;