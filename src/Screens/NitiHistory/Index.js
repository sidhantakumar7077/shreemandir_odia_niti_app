import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { base_url } from '../../../App';
import moment from 'moment';

const Index = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    // Grouped by date: [{ date: 'YYYY-MM-DD', entries: [...] }]
    const [nitiByDate, setNitiByDate] = useState([]);
    const [loading, setLoading] = useState(false);

    // Default: yesterday → yesterday
    const yesterday = moment().subtract(1, 'day').toDate();
    const today = new Date();

    const [fromDate, setFromDate] = useState(yesterday);
    const [toDate, setToDate] = useState(yesterday);
    const [openFromPicker, setOpenFromPicker] = useState(false);
    const [openToPicker, setOpenToPicker] = useState(false);

    const getNitiHistory = async (from = fromDate, to = toDate) => {
        setLoading(true);
        try {
            let start = moment(from);
            let end = moment(to);

            // Ensure from <= to
            if (end.isBefore(start, 'day')) {
                const temp = start;
                start = end;
                end = temp;
            }

            // Also clamp to today just in case
            if (end.isAfter(moment(), 'day')) {
                end = moment();
            }

            const fromStr = start.format('YYYY-MM-DD');
            const toStr = end.format('YYYY-MM-DD');

            const url = `${base_url}api/niti/transactions/${fromStr}/${toStr}`;
            const response = await fetch(url);
            const result = await response.json();

            if (result?.status && Array.isArray(result?.data) && result.data.length > 0) {
                // Keep the data grouped by date from API
                setNitiByDate(result.data);
            } else {
                setNitiByDate([]);
            }
        } catch (e) {
            setNitiByDate([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            getNitiHistory(yesterday, yesterday);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused]);

    // Render a single entry card (for one niti)
    const renderEntryCard = (entry) => (
        <View
            key={`entry-${entry.niti_id}-${entry.start_time}-${entry.end_time}`}
            style={{
                backgroundColor: '#fff',
                marginBottom: 10,
                padding: 15,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            <Text
                style={{
                    color: '#1a1a1a',
                    fontSize: 16,
                    fontWeight: '700',
                    marginBottom: 5,
                }}
            >
                {entry.niti_name}
            </Text>

            {/* Start Time Block */}
            <View style={{ marginBottom: 8 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ fontSize: 15, color: '#333' }}>
                        ସମ୍ପାଦିତ ସମୟ:{' '}
                        {entry.start_time
                            ? moment(entry.start_time, 'HH:mm:ss').format('HH:mm:ss')
                            : '--:--:--'}
                    </Text>
                </View>
                {entry.start_user_id && (
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#666',
                            marginTop: 2,
                        }}
                    >
                        ➤ ଆରମ୍ଭ: {entry.start_user_id} ({entry.start_user_name})
                    </Text>
                )}
                {entry.start_time_edit_user_id && (
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#666',
                            marginTop: 2,
                        }}
                    >
                        ✎ ଆରମ୍ଭ ସଂଶୋଧନ: {entry.start_time_edit_user_id} (
                        {entry.start_time_edit_user_name})
                    </Text>
                )}
            </View>

            {/* End Time Block */}
            {entry.niti_status === 'Completed' && (
                <>
                    <View style={{ marginBottom: 8 }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 15, color: '#333' }}>
                                ସମାପନ ସମୟ:{' '}
                                {entry.end_time
                                    ? moment(entry.end_time, 'HH:mm:ss').format('HH:mm:ss')
                                    : '--:--:--'}
                            </Text>
                        </View>
                        {entry.end_user_id && (
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: '#666',
                                    marginTop: 2,
                                }}
                            >
                                ➤ ସମାପନ: {entry.end_user_id} ({entry.end_user_name})
                            </Text>
                        )}
                        {entry.end_time_edit_user_id && (
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: '#666',
                                    marginTop: 2,
                                }}
                            >
                                ✎ ସମାପନ ସଂଶୋଧନ: {entry.end_time_edit_user_id} (
                                {entry.end_time_edit_user_name})
                            </Text>
                        )}
                    </View>

                    {/* Duration */}
                    {entry.start_time && entry.end_time && (
                        <View
                            style={{
                                backgroundColor: '#f0f4ff',
                                padding: 8,
                                borderRadius: 8,
                                alignSelf: 'flex-start',
                                marginBottom: 10,
                            }}
                        >
                            {(() => {
                                const start = moment(entry.start_time, 'HH:mm:ss');
                                let end = moment(entry.end_time, 'HH:mm:ss');
                                if (end.isBefore(start)) end.add(1, 'day');
                                const duration = moment.duration(end.diff(start));
                                const hours = String(duration.hours()).padStart(2, '0');
                                const minutes = String(duration.minutes()).padStart(2, '0');
                                const seconds = String(duration.seconds()).padStart(2, '0');
                                return (
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: '500',
                                            color: '#222',
                                        }}
                                    >
                                        🕒 ମୋଟ ଅବଧି: {hours}:{minutes}:{seconds}
                                    </Text>
                                );
                            })()}
                        </View>
                    )}
                </>
            )}

            {/* Not Done Block */}
            {entry.niti_status === 'NotStarted' && (
                <View style={{ marginBottom: 8 }}>
                    <Text
                        style={{
                            fontSize: 14,
                            color: '#B7070A',
                            fontWeight: '600',
                        }}
                    >
                        ସମ୍ପାଦିତ: {entry.not_done_user_id} ({entry.not_done_user_name})
                    </Text>
                </View>
            )}

            {/* Status */}
            <View
                style={{
                    backgroundColor:
                        entry.niti_status === 'Completed'
                            ? '#d4edda'
                            : entry.niti_status === 'Started'
                                ? '#fff3cd'
                                : '#f8d7da',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    alignSelf: 'flex-start',
                }}
            >
                <Text
                    style={{
                        color:
                            entry.niti_status === 'Completed'
                                ? '#155724'
                                : entry.niti_status === 'Started'
                                    ? '#856404'
                                    : '#721c24',
                        fontSize: 13,
                        fontWeight: '600',
                    }}
                >
                    {entry.niti_status === 'Completed'
                        ? '✔ ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଛି'
                        : entry.niti_status === 'Started'
                            ? '⌛ ଚାଲୁଛି'
                            : '❌ ନୀତି ହୋଇନାହିଁ'}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerPart}>
                <TouchableOpacity
                    style={{ justifyContent: 'center' }}
                    onPress={() => {
                        navigation.goBack();
                    }}
                >
                    <FontAwesome5 name="arrow-left" size={22} color="#FFF" />
                </TouchableOpacity>
                <Text
                    style={{
                        color: '#FFF',
                        fontSize: 20,
                        fontWeight: '700',
                        marginLeft: 15,
                    }}
                >
                    ନୀତି ଇତିହାସ
                </Text>
            </View>

            {/* Date Filter Bar */}
            <View style={styles.filterContainer}>
                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>From</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setOpenFromPicker(true)}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#B7070A"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.dateText}>
                            {moment(fromDate).format('DD MMM YYYY')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.filterItem}>
                    <Text style={styles.filterLabel}>To</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setOpenToPicker(true)}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={18}
                            color="#B7070A"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={styles.dateText}>
                            {moment(toDate).format('DD MMM YYYY')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => getNitiHistory(fromDate, toDate)}
                >
                    <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
            </View>

            {/* Date Pickers - with maxDate = today */}
            <DatePicker
                modal
                mode="date"
                open={openFromPicker}
                date={fromDate}
                maximumDate={today}
                onConfirm={(date) => {
                    setOpenFromPicker(false);
                    setFromDate(date);
                }}
                onCancel={() => setOpenFromPicker(false)}
            />

            <DatePicker
                modal
                mode="date"
                open={openToPicker}
                date={toDate}
                maximumDate={today}
                onConfirm={(date) => {
                    setOpenToPicker(false);
                    setToDate(date);
                }}
                onCancel={() => setOpenToPicker(false)}
            />

            {/* List */}
            <View style={{ flex: 1, marginTop: 10 }}>
                {loading ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <ActivityIndicator size="large" color="#B7070A" />
                        <Text style={{ marginTop: 8, color: '#7c2d12' }}>
                            ତଥ୍ୟ ଲୋଡ୍‍ ହେଉଛି...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        // sort by date descending
                        data={[...nitiByDate].sort((a, b) =>
                            moment(b.date).diff(moment(a.date), 'days')
                        )}
                        keyExtractor={(item, index) => `date-${item.date}-${index}`}
                        ListEmptyComponent={() => (
                            <View
                                style={{
                                    marginTop: '40%',
                                    alignItems: 'center',
                                    paddingHorizontal: 20,
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#7c2d12',
                                        fontSize: 16,
                                        textAlign: 'center',
                                    }}
                                >
                                    ଚୟନିତ ତାରିଖ ମଧ୍ୟରେ କୌଣସି ନୀତି ଇତିହାସ ମିଳିଲା ନାହିଁ।
                                </Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    width: '94%',
                                    alignSelf: 'center',
                                    marginBottom: 16,
                                }}
                            >
                                {/* Date Header */}
                                <View
                                    style={{
                                        backgroundColor: '#B7070A',
                                        paddingVertical: 6,
                                        paddingHorizontal: 12,
                                        borderRadius: 16,
                                        alignSelf: 'flex-start',
                                        marginBottom: 8,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontWeight: '700',
                                            fontSize: 13,
                                        }}
                                    >
                                        {moment(item.date).format('DD MMM YYYY')}
                                    </Text>
                                </View>

                                {/* Entries for this date */}
                                {Array.isArray(item.entries) && item.entries.length > 0 ? (
                                    item.entries
                                        .slice() // copy
                                        // .reverse() // latest last to first
                                        .map((entry) => renderEntryCard(entry))
                                ) : (
                                    <View
                                        style={{
                                            backgroundColor: '#fff',
                                            padding: 12,
                                            borderRadius: 10,
                                            shadowColor: '#000',
                                            shadowOpacity: 0.05,
                                            shadowRadius: 3,
                                            shadowOffset: { width: 0, height: 1 },
                                            elevation: 2,
                                        }}
                                    >
                                        <Text style={{ fontSize: 13, color: '#6b7280' }}>
                                            ଏହି ତାରିଖରେ କୌଣସି ନୀତି ଇତିହାସ ନାହିଁ।
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFBE00',
    },
    headerPart: {
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: '#B7070A',
        paddingVertical: 20,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 13,
        elevation: 5,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 6,
    },
    filterItem: {
        flex: 1,
        marginRight: 8,
    },
    filterLabel: {
        fontSize: 12,
        color: '#4b5563',
        marginBottom: 4,
        fontWeight: '600',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff8e1',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#fcd34d',
    },
    dateText: {
        fontSize: 13,
        color: '#1f2933',
    },
    applyButton: {
        backgroundColor: '#B7070A',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
});