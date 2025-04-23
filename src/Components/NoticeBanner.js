import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import TextTicker from 'react-native-text-ticker';
import { useNavigation } from '@react-navigation/native';

const NoticeBanner = ({ noticeText }) => {

    const navigation = useNavigation();

    return (
        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('Notice')}>
            <Text style={styles.label}>📢 ସୂଚନା:</Text>
            <View style={styles.marqueeWrapper}>
                <TextTicker
                    style={styles.noticeText}
                    duration={8000}
                    loop
                    bounce={false}
                    repeatSpacer={70}
                // marqueeDelay={0}
                >
                    {noticeText}
                </TextTicker>
            </View>
        </TouchableOpacity>
    );
};

export default NoticeBanner;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        overflow: 'hidden',
        borderBottomColor: '#ffcc80',
        borderBottomWidth: 1,
    },
    label: {
        fontWeight: '700',
        color: '#e65100',
        marginRight: 10,
        fontSize: 14,
    },
    marqueeWrapper: {
        flex: 1,
        overflow: 'hidden',
    },
    noticeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4e342e',
        whiteSpace: 'nowrap',
    },
});
