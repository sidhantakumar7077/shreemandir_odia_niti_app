import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Modal,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ToastAndroid,
    ScrollView,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import LinearGradient from 'react-native-linear-gradient';
import { base_url } from '../../../App';
import moment from 'moment';

const Index = () => {
    const [hundiList, setHundiList] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [hundiData, setHundiData] = useState({
        rupees: '',
        gold: '',
        silver: '',
        mixedGold: '',
        mixedSilver: '',
    });
    const [hundiDate, setHundiDate] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [refreshing, setRefreshing] = React.useState(false);
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            getHundiCollection();
        }, 2000);
    }, []);

    const getHundiCollection = async () => {
        try {
            const response = await fetch(`${base_url}api/get-hundi-collections`);
            const result = await response.json();
            if (result.status) {
                if (result.data && result.data.length > 0) {
                    setHundiList(result.data);
                } else {
                    setHundiList([]);
                    ToastAndroid.show(
                        'କୌଣସି ହୁଣ୍ଡି ସଂଗ୍ରହ ନାହିଁ',
                        ToastAndroid.SHORT
                    );
                }
            } else {
                setHundiList([]);
                ToastAndroid.show(
                    'Error fetching hundi collection',
                    ToastAndroid.SHORT
                );
            }
        } catch (error) {
            console.log('Error fetching hundi collection', error);
        }
    };

    useEffect(() => {
        getHundiCollection();
    }, []);

    const handleSaveHundi = async () => {
        const token = await AsyncStorage.getItem('storeAccesstoken');

        try {
            const payload = {
                date: moment(hundiDate).format('YYYY-MM-DD'),
                rupees: hundiData.rupees,
                gold: `${hundiData.gold}`,
                silver: `${hundiData.silver}`,
                mix_gold: hundiData.mixedGold || '',
                mix_silver: hundiData.mixedSilver || '',
            };

            const url = `${base_url}api/save-hundi-collection`;
            const method = 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.status) {
                ToastAndroid.show('ସେଭ୍‍ କରାଯାଇଛି', ToastAndroid.SHORT);
                setHundiData({
                    rupees: '',
                    gold: '',
                    silver: '',
                    mixedGold: '',
                    mixedSilver: '',
                });
                setHundiDate(new Date());
                setIsModalVisible(false);
                getHundiCollection();
            } else {
                ToastAndroid.show('ସେଭ୍ ହୋଇପାରିଲା ନାହିଁ', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('ତ୍ରୁଟି ଘଟିଛି', ToastAndroid.SHORT);
            console.log('Save Hundi Error:', error);
        }
    };

    const handleUpdateHundi = async () => {
        const token = await AsyncStorage.getItem('storeAccesstoken');
        const payload = {
            id: editingItem.id,
            date: moment(hundiDate).format('YYYY-MM-DD'),
            rupees: hundiData.rupees,
            gold: `${hundiData.gold}`,
            silver: `${hundiData.silver}`,
            mix_gold: hundiData.mixedGold || '',
            mix_silver: hundiData.mixedSilver || '',
        };

        try {
            const response = await fetch(`${base_url}api/hundi/update`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get('content-type');
            const rawText = await response.text();
            console.log('Raw Response:', rawText);

            if (!contentType || !contentType.includes('application/json')) {
                ToastAndroid.show(
                    'ଅପ୍ରତ୍ୟାଶିତ ସର୍ଭର ପ୍ରତିକ୍ରିୟା',
                    ToastAndroid.SHORT
                );
                console.error('Expected JSON but got:', rawText);
                return;
            }

            const result = JSON.parse(rawText);
            if (response.ok && result.status) {
                ToastAndroid.show('ଅପଡେଟ୍‍ ହୋଇଛି', ToastAndroid.SHORT);
                setHundiData({
                    rupees: '',
                    gold: '',
                    silver: '',
                    mixedGold: '',
                    mixedSilver: '',
                });
                setHundiDate(new Date());
                setIsModalVisible(false);
                setIsEditMode(false);
                setEditingItem(null);
                getHundiCollection();
            } else {
                ToastAndroid.show(
                    result.message || 'ଅପଡେଟ୍‍ ହୋଇପାରିଲା ନାହିଁ',
                    ToastAndroid.SHORT
                );
                console.error('Update failed:', result);
            }
        } catch (error) {
            ToastAndroid.show('Network or server error!', ToastAndroid.SHORT);
            console.error('Fetch error:', error);
        }
    };

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);

    const confirmDeleteHundi = (id) => {
        setDeletingItemId(id);
        setDeleteModalVisible(true);
    };

    const handleDeleteHundi = async () => {
        try {
            const response = await fetch(
                `${base_url}api/hundi/delete/${deletingItemId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );
            const contentType = response.headers.get('content-type');
            const rawText = await response.text();
            console.log('Raw Response:', rawText);
            if (!contentType || !contentType.includes('application/json')) {
                ToastAndroid.show(
                    'ଅପ୍ରତ୍ୟାଶିତ ସର୍ଭର ପ୍ରତିକ୍ରିୟା',
                    ToastAndroid.SHORT
                );
                console.error('Expected JSON but got:', rawText);
                return;
            }
            const result = JSON.parse(rawText);
            if (response.ok && result.status) {
                ToastAndroid.show(
                    'ହୁଣ୍ଡି ସଂଗ୍ରହ ଡିଲିଟ୍‍ ହୋଇଛି',
                    ToastAndroid.SHORT
                );
                setDeleteModalVisible(false);
                setDeletingItemId(null);
                getHundiCollection();
            } else {
                ToastAndroid.show(
                    result.message || 'ହୁଣ୍ଡି ସଂଗ୍ରହ ଡିଲିଟ୍‍ ହୋଇପାରିଲା ନାହିଁ',
                    ToastAndroid.SHORT
                );
                console.error('Delete failed:', result);
            }
        } catch (error) {
            ToastAndroid.show('Network or server error!', ToastAndroid.SHORT);
            console.error('Delete error:', error);
        } finally {
            setDeleteModalVisible(false);
            setDeletingItemId(null);
        }
    };

    const todaysHundiListReversed = [...hundiList].slice(0, 5);

    const renderItem = ({ item, index }) => (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View>
                    <Text style={styles.cardDate}>
                        {moment(item.date).format('DD MMM YYYY')}
                    </Text>
                    <Text style={styles.cardMeta}>
                        ₹{item.rupees} • 🥇 {item.gold} • 🥈 {item.silver}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {index === 0 && (
                        <>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsModalVisible(true);
                                    setIsEditMode(true);
                                    setEditingItem(item);
                                    setHundiData({
                                        rupees: item.rupees.toString(),
                                        gold: item.gold,
                                        silver: item.silver,
                                        mixedGold: item.mix_gold,
                                        mixedSilver: item.mix_silver,
                                    });
                                    setHundiDate(new Date(item.date));
                                }}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={20}
                                    color="#B7070A"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => confirmDeleteHundi(item.id)}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={20}
                                    color="#B7070A"
                                />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            <View style={{ marginTop: 6 }}>
                {item.mix_gold ? (
                    <Text style={styles.cardText}>🥇 ମିଶା ସୁନା: {item.mix_gold}</Text>
                ) : null}
                {item.mix_silver ? (
                    <Text style={styles.cardText}>🥈 ମିଶା ରୂପା: {item.mix_silver}</Text>
                ) : null}
            </View>

            <View style={{ marginTop: 8 }}>
                <Text style={styles.cardFooter}>
                    Added by: {item.hundi_insert_user_id}
                </Text>
                {item.hundi_update_user_id ? (
                    <Text style={styles.cardFooter}>
                        Updated by: {item.hundi_update_user_id}
                    </Text>
                ) : null}
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={['#B7070A', '#d17025ff', '#FFBE00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.background}
        >
            <View style={styles.container}>
                {/* Header */}
                <LinearGradient
                    colors={['#B7070A', '#f97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <View>
                        <Text style={styles.headerTitle}>ହୁଣ୍ଡି ସଂଗ୍ରହ</Text>
                        <Text style={styles.headerSubtitle}>
                            ଆଜିର ହୁଣ୍ଡି ରାଶି ଏବଂ ଧାତୁ ସଂଗ୍ରହ
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setIsModalVisible(true);
                            setIsEditMode(false);
                            setHundiData({
                                rupees: '',
                                gold: '',
                                silver: '',
                                mixedGold: '',
                                mixedSilver: '',
                            });
                            setHundiDate(new Date());
                        }}
                        style={styles.addButton}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>

                {/* Info row */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoText}>
                        Recent records:{' '}
                        <Text style={styles.infoCount}>{todaysHundiListReversed.length}</Text>
                    </Text>
                </View>

                {/* List */}
                <FlatList
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    data={todaysHundiListReversed}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    ListEmptyComponent={() => (
                        <View
                            style={{ marginTop: '40%', alignItems: 'center' }}
                        >
                            <Text style={{ color: '#fef9c3', fontSize: 16 }}>
                                କୌଣସି ହୁଣ୍ଡି ସଂଗ୍ରହ ନାହିଁ
                            </Text>
                        </View>
                    )}
                />

                {/* Add / Update Hundi Modal */}
                <Modal
                    visible={isModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <LinearGradient
                                colors={['#fff7ed', '#fefce8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.modalGradient}
                            >
                                <ScrollView
                                    contentContainerStyle={styles.modalContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.modalHeaderRow}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={styles.modalIconCircle}>
                                                <Ionicons
                                                    name="cash-outline"
                                                    size={20}
                                                    color="#B7070A"
                                                />
                                            </View>
                                            <View>
                                                <Text style={styles.modalTitle}>
                                                    {isEditMode ? 'ହୁଣ୍ଡି ଅପଡେଟ୍‍' : 'ଆଜିର ହୁଣ୍ଡି ସଂଗ୍ରହ'}
                                                </Text>
                                                <Text style={styles.modalSubtitle}>
                                                    ରାଶି ଏବଂ ଧାତୁ ସମ୍ବନ୍ଧିତ ତଥ୍ୟ ଦିଅନ୍ତୁ।
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setIsModalVisible(false);
                                                setIsEditMode(false);
                                                setEditingItem(null);
                                            }}
                                        >
                                            <Ionicons
                                                name="close"
                                                size={22}
                                                color="#9ca3af"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.label}>ଟଙ୍କା</Text>
                                    <TextInput
                                        placeholder="ଟଙ୍କା"
                                        keyboardType="numeric"
                                        value={hundiData.rupees}
                                        onChangeText={(val) =>
                                            setHundiData({ ...hundiData, rupees: val })
                                        }
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>ସୁନା</Text>
                                    <TextInput
                                        placeholder="ସୁନା"
                                        keyboardType="default"
                                        value={hundiData.gold}
                                        onChangeText={(val) =>
                                            setHundiData({ ...hundiData, gold: val })
                                        }
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>ମିଶା ସୁନା</Text>
                                    <TextInput
                                        placeholder="ମିଶା ସୁନା"
                                        keyboardType="default"
                                        value={hundiData.mixedGold}
                                        onChangeText={(val) =>
                                            setHundiData({ ...hundiData, mixedGold: val })
                                        }
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>ରୂପା</Text>
                                    <TextInput
                                        placeholder="ରୂପା"
                                        keyboardType="default"
                                        value={hundiData.silver}
                                        onChangeText={(val) =>
                                            setHundiData({ ...hundiData, silver: val })
                                        }
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>ମିଶା ରୂପା</Text>
                                    <TextInput
                                        placeholder="ମିଶା ରୂପା"
                                        keyboardType="default"
                                        value={hundiData.mixedSilver}
                                        onChangeText={(val) =>
                                            setHundiData({ ...hundiData, mixedSilver: val })
                                        }
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>ତାରିଖ</Text>
                                    <TouchableOpacity
                                        onPress={() => setOpenDatePicker(true)}
                                        style={styles.dateBtn}
                                    >
                                        <Ionicons
                                            name="calendar-outline"
                                            size={18}
                                            color="#B7070A"
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text style={styles.dateBtnText}>
                                            {moment(hundiDate).format('DD MMM YYYY')}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={isEditMode ? handleUpdateHundi : handleSaveHundi}
                                        style={styles.saveBtnWrapper}
                                    >
                                        <LinearGradient
                                            colors={['#f97316', '#facc15']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.saveBtn}
                                        >
                                            <Text style={styles.saveBtnText}>
                                                {isEditMode ? 'Update' : 'Save'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsModalVisible(false);
                                            setIsEditMode(false);
                                            setEditingItem(null);
                                        }}
                                        style={styles.cancelBtn}
                                    >
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </LinearGradient>
                        </View>

                        <DatePicker
                            modal
                            open={openDatePicker}
                            date={hundiDate}
                            mode="date"
                            onConfirm={(date) => {
                                setOpenDatePicker(false);
                                setHundiDate(date);
                            }}
                            onCancel={() => setOpenDatePicker(false)}
                        />
                    </View>
                </Modal>

                {/* Delete Hundi Modal */}
                <Modal
                    visible={deleteModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.deleteOverlay}>
                        <View style={styles.deleteBox}>
                            <View style={styles.deleteIconCircle}>
                                <Ionicons
                                    name="trash-bin"
                                    size={36}
                                    color="#B7070A"
                                />
                            </View>

                            <Text style={styles.deleteTitle}>
                                ହୁଣ୍ଡି ସଂଗ୍ରହ ଡିଲିଟ୍‍ କରନ୍ତୁ
                            </Text>
                            <Text style={styles.deleteMessage}>
                                ଆପଣ ନିଶ୍ଚିତ ଭାବେ ଏହାକୁ ଡିଲିଟ୍‍ କରିବାକୁ ଚାହାଁଛନ୍ତି କି?
                            </Text>

                            <TouchableOpacity
                                onPress={handleDeleteHundi}
                                style={styles.deleteConfirmBtn}
                            >
                                <Text style={styles.deleteConfirmText}>ଡିଲିଟ୍‍ କରନ୍ତୁ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                style={styles.deleteCancelBtn}
                            >
                                <Text style={styles.deleteCancelText}>ବାତିଲ୍‍ କରନ୍ତୁ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </LinearGradient>
    );
};

export default Index;

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 15,
    },
    header: {
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 6,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#fde68a',
        marginTop: 2,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoRow: {
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#fef9c3',
    },
    infoCount: {
        fontWeight: '700',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        borderLeftWidth: 4,
        borderLeftColor: '#B7070A',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardDate: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2933',
    },
    cardMeta: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    cardText: {
        fontSize: 13,
        color: '#4b5563',
        marginTop: 3,
    },
    cardFooter: {
        fontSize: 11,
        color: '#9ca3af',
    },

    /* Add / Update Modal */
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalContainer: {
        width: '92%',
        maxHeight: '90%',
        borderRadius: 22,
        overflow: 'hidden',
        elevation: 10,
    },
    modalGradient: {
        // flex: 1,
        // paddingBottom: 100,
    },
    modalContent: {
        padding: 18,
        paddingBottom: 22,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    modalIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#B7070A',
    },
    modalSubtitle: {
        fontSize: 11,
        color: '#6b7280',
    },
    label: {
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
        fontSize: 13,
        marginTop: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 10,
        marginBottom: 6,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#f9fafb',
    },
    dateBtn: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginTop: 2,
        marginBottom: 12,
        backgroundColor: '#f9fafb',
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateBtnText: {
        color: '#374151',
        fontSize: 13,
    },
    saveBtnWrapper: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 4,
    },
    saveBtn: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 14,
    },
    saveBtnText: {
        color: '#451a03',
        fontWeight: '700',
        fontSize: 15,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 10,
        backgroundColor: '#fee2e2',
        borderRadius: 10,
    },
    cancelText: {
        color: '#B7070A',
        fontWeight: '500',
    },

    /* Delete Modal */
    deleteOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    deleteBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    deleteIconCircle: {
        backgroundColor: '#FDECEC',
        padding: 20,
        borderRadius: 50,
        marginBottom: 20,
    },
    deleteTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 8,
        textAlign: 'center',
    },
    deleteMessage: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
    },
    deleteConfirmBtn: {
        width: '100%',
        backgroundColor: '#B7070A',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 12,
        alignItems: 'center',
    },
    deleteConfirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteCancelBtn: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#B7070A',
        alignItems: 'center',
    },
    deleteCancelText: {
        color: '#B7070A',
        fontSize: 16,
    },
});