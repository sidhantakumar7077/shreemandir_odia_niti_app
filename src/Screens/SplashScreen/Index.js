import { StyleSheet, Image, View, Text } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const Index = () => {
    return (
        <LinearGradient colors={['#fff4cc', '#FFBE00']} style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image
                    style={styles.logo}
                    source={require('../../assets/images/ratha.jpeg')}
                />
                <Text style={styles.title}>ଶ୍ରୀ ମନ୍ଦିର ନୀତି ଆପ୍</Text>
                {/* <Text style={styles.subtitle}>Experience Divinity Every Day</Text> */}
            </View>
        </LinearGradient>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        height: 400,
        width: 300,
        resizeMode: 'cover',
        borderRadius: 400,
        borderWidth: 4,
        borderColor: '#B7070A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#B7070A',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
});
