import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, TextInput, StyleSheet, ToastAndroid, ScrollView, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { base_url } from '../../../App';
import moment from 'moment';

const Index = () => {
    const [hundiList, setHundiList] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [hundiData, setHundiData] = useState({ rupees: '', gold: '', silver: '', mixedGold: '', mixedSilver: '' });
    const [hundiDate, setHundiDate] = useState(new Date());
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [refreshing, setRefreshing] = React.useState(false);
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            console.log("Refreshing Successful");
            getHundiCollection();
        }, 2000);
    }, []);

    const getHundiCollection = async () => {
        try {
            const response = await fetch(`${base_url}api/get-hundi-collections`);
            const result = await response.json();
            if (result.status) setHundiList(result.data);
            // console.log("Hundi Collection:", result.data);
        } catch (error) {
            console.log("Error fetching hundi collection", error);
        }
    };

    useEffect(() => {
        getHundiCollection();
    }, []);

    const handleSaveHundi = async () => {
        try {
            const payload = {
                date: moment(hundiDate).format('YYYY-MM-DD'),
                rupees: hundiData.rupees,
                gold: `${hundiData.gold}`,
                silver: `${hundiData.silver}`,
                mix_gold: hundiData.mixedGold || '', // Optional field
                mix_silver: hundiData.mixedSilver || '' // Optional field
            };

            // console.log("Payload to save:", payload);
            // return;

            const url = `${base_url}api/save-hundi-collection`;
            const method = 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.status) {
                ToastAndroid.show('ସେଭ୍‍ କରାଯାଇଛି', ToastAndroid.SHORT);
                setHundiData({ rupees: '', gold: '', silver: '', mixedGold: '', mixedSilver: '' });
                setHundiDate(new Date());
                setIsModalVisible(false);
                getHundiCollection();
            } else {
                ToastAndroid.show('ସେଭ୍ ହୋଇପାରିଲା ନାହିଁ', ToastAndroid.SHORT);
            }
        } catch (error) {
            ToastAndroid.show('ତ୍ରୁଟି ଘଟିଛି', ToastAndroid.SHORT);
            console.log("Save Hundi Error:", error);
        }
    };

    const handleUpdateHundi = async () => {
        const payload = {
            id: editingItem.id,
            date: moment(hundiDate).format('YYYY-MM-DD'),
            rupees: hundiData.rupees,
            gold: `${hundiData.gold}`,
            silver: `${hundiData.silver}`,
            mix_gold: hundiData.mixedGold || '', // Optional field
            mix_silver: hundiData.mixedSilver || '' // Optional field
        };

        try {
            const response = await fetch(`${base_url}api/hundi/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get("content-type");
            const rawText = await response.text();
            console.log("Raw Response:", rawText);

            if (!contentType || !contentType.includes("application/json")) {
                ToastAndroid.show('ଅପ୍ରତ୍ୟାଶିତ ସର୍ଭର ପ୍ରତିକ୍ରିୟା', ToastAndroid.SHORT);
                console.error("Expected JSON but got:", rawText);
                return;
            }

            const result = JSON.parse(rawText); // Now safe to parse
            if (response.ok && result.status) {
                ToastAndroid.show('ଅପଡେଟ୍‍ ହୋଇଛି', ToastAndroid.SHORT);
                setHundiData({ rupees: '', gold: '', silver: '', mixedGold: '', mixedSilver: '' });
                setHundiDate(new Date());
                setIsModalVisible(false);
                setIsEditMode(false);
                setEditingItem(null);
                getHundiCollection();
            } else {
                ToastAndroid.show(result.message || 'ଅପଡେଟ୍‍ ହୋଇପାରିଲା ନାହିଁ', ToastAndroid.SHORT);
                console.error("Update failed:", result);
            }
        } catch (error) {
            ToastAndroid.show('Network or server error!', ToastAndroid.SHORT);
            console.error("Fetch error:", error);
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
            const response = await fetch(`${base_url}api/hundi/delete/${deletingItemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            const contentType = response.headers.get("content-type");
            const rawText = await response.text();
            console.log("Raw Response:", rawText);
            if (!contentType || !contentType.includes("application/json")) {
                ToastAndroid.show('ଅପ୍ରତ୍ୟାଶିତ ସର୍ଭର ପ୍ରତିକ୍ରିୟା', ToastAndroid.SHORT);
                console.error("Expected JSON but got:", rawText);
                return;
            }
            const result = JSON.parse(rawText); // Now safe to parse
            if (response.ok && result.status) {
                ToastAndroid.show('ହୁଣ୍ଡି ସଂଗ୍ରହ ଡିଲିଟ୍‍ ହୋଇଛି', ToastAndroid.SHORT);
                setDeleteModalVisible(false);
                setDeletingItemId(null);
                getHundiCollection();
            }
            else {
                ToastAndroid.show(result.message || 'ହୁଣ୍ଡି ସଂଗ୍ରହ ଡିଲିଟ୍‍ ହୋଇପାରିଲା ନାହିଁ', ToastAndroid.SHORT);
                console.error("Delete failed:", result);
            }
        } catch (error) {
            ToastAndroid.show('Network or server error!', ToastAndroid.SHORT);
            console.error("Delete error:", error);
        } finally {
            setDeleteModalVisible(false);
            setDeletingItemId(null);
        }
    };

    // const todayDate = moment().format('YYYY-MM-DD');
    // const todaysHundiList = hundiList.filter(item => item.date === todayDate);
    const todaysHundiListReversed = [...hundiList].slice(0, 5);

    const renderItem = ({ item, index }) => (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <Text style={styles.cardDate}>{moment(item.date).format('DD MMM YYYY')}</Text>
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
                                        mixedSilver: item.mix_silver
                                    });
                                    setHundiDate(new Date(item.date));
                                }}
                            >
                                <Ionicons name="create-outline" size={20} color="#B7070A" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => confirmDeleteHundi(item.id)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#B7070A" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
            <Text style={styles.cardText}>💰 ₹{item.rupees}</Text>
            <Text style={styles.cardText}>🥇 {item.gold}</Text>
            {(item.mix_gold && <Text style={styles.cardText}>🥇 {item.mix_gold}</Text>)}
            <Text style={styles.cardText}>🥈 {item.silver}</Text>
            {(item.mix_silver && <Text style={styles.cardText}>🥈 {item.mix_silver}</Text>)}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ହୁଣ୍ଡି ସଂଗ୍ରହ</Text>
                <TouchableOpacity
                    onPress={() => {
                        setIsModalVisible(true);
                        setIsEditMode(false);
                        setHundiData({ rupees: '', gold: '', silver: '', mixedGold: '', mixedSilver: '' });
                        setHundiDate(new Date());
                    }}>
                    <Ionicons name="add-circle" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* <View style={{ marginBottom: 10, padding: 20, width: '95%', alignSelf: 'center', borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.5, elevation: 3 }}>
                <Text style={styles.label}>ଟଙ୍କା</Text>
                <TextInput
                    placeholder="ଟଙ୍କା"
                    keyboardType="numeric"
                    value={hundiData.rupees}
                    onChangeText={(val) => setHundiData({ ...hundiData, rupees: val })}
                    style={styles.input}
                />

                <Text style={styles.label}>ସୁନା</Text>
                <TextInput
                    placeholder="ସୁନା"
                    keyboardType="default"
                    value={hundiData.gold.toString()}
                    onChangeText={(val) => setHundiData({ ...hundiData, gold: val })}
                    style={styles.input}
                />

                <Text style={styles.label}>ମିଶା ସୁନା</Text>
                <TextInput
                    placeholder="ସୁନା"
                    keyboardType="default"
                    value={hundiData.gold.toString()}
                    onChangeText={(val) => setHundiData({ ...hundiData, gold: val })}
                    style={styles.input}
                />

                <Text style={styles.label}>ରୂପା</Text>
                <TextInput
                    placeholder="ରୂପା"
                    keyboardType="default"
                    value={hundiData.silver.toString()}
                    onChangeText={(val) => setHundiData({ ...hundiData, silver: val })}
                    style={styles.input}
                />

                <Text style={styles.label}>ମିଶା ରୂପା</Text>
                <TextInput
                    placeholder="ରୂପା"
                    keyboardType="default"
                    value={hundiData.silver.toString()}
                    onChangeText={(val) => setHundiData({ ...hundiData, silver: val })}
                    style={styles.input}
                />

                <Text style={styles.label}>ତାରିଖ</Text>
                <TouchableOpacity onPress={() => setOpenDatePicker(true)} style={styles.dateBtn}>
                    <Text style={{ color: '#333' }}>{moment(hundiDate).format("DD MMM YYYY")}</Text>
                </TouchableOpacity>
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

                <TouchableOpacity onPress={isEditMode ? handleUpdateHundi : handleSaveHundi} style={styles.saveBtn}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isEditMode ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
            </View> */}

            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                data={todaysHundiListReversed}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />

            <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalBox}>
                        <Text style={styles.modalTitle}>ଆଜିର ହୁଣ୍ଡି ସଂଗ୍ରହ</Text>

                        <Text style={styles.label}>ଟଙ୍କା</Text>
                        <TextInput
                            placeholder="ଟଙ୍କା"
                            keyboardType="numeric"
                            value={hundiData.rupees}
                            onChangeText={(val) => setHundiData({ ...hundiData, rupees: val })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>ସୁନା</Text>
                        <TextInput
                            placeholder="ସୁନା"
                            keyboardType="default"
                            value={hundiData.gold}
                            onChangeText={(val) => setHundiData({ ...hundiData, gold: val })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>ମିଶା ସୁନା</Text>
                        <TextInput
                            placeholder="ସୁନା"
                            keyboardType="default"
                            value={hundiData.mixedGold}
                            onChangeText={(val) => setHundiData({ ...hundiData, mixedGold: val })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>ରୂପା</Text>
                        <TextInput
                            placeholder="ରୂପା"
                            keyboardType="default"
                            value={hundiData.silver}
                            onChangeText={(val) => setHundiData({ ...hundiData, silver: val })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>ମିଶା ରୂପା</Text>
                        <TextInput
                            placeholder="ରୂପା"
                            keyboardType="default"
                            value={hundiData.mixedSilver}
                            onChangeText={(val) => setHundiData({ ...hundiData, mixedSilver: val })}
                            style={styles.input}
                        />

                        <Text style={styles.label}>ତାରିଖ</Text>
                        <TouchableOpacity onPress={() => setOpenDatePicker(true)} style={styles.dateBtn}>
                            <Text style={{ color: '#333' }}>{moment(hundiDate).format("DD MMM YYYY")}</Text>
                        </TouchableOpacity>
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

                        <TouchableOpacity onPress={isEditMode ? handleUpdateHundi : handleSaveHundi} style={styles.saveBtn}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isEditMode ? 'Update' : 'Save'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setIsModalVisible(false); setIsEditMode(false); setEditingItem(null); }} style={styles.cancelBtn}>
                            <Text style={{ color: '#B7070A' }}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Delete Hundi Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: 20,
                }}>
                    <View style={{
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
                    }}>
                        <View style={{
                            backgroundColor: '#FDECEC',
                            padding: 20,
                            borderRadius: 50,
                            marginBottom: 20
                        }}>
                            <Ionicons name="trash-bin" size={36} color="#B7070A" />
                        </View>

                        <Text style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: '#222',
                            marginBottom: 8,
                            textAlign: 'center'
                        }}>
                            ହୁଣ୍ଡି ସଂଗ୍ରହ ଡିଲିଟ୍‍ କରନ୍ତୁ
                        </Text>
                        <Text style={{
                            fontSize: 15,
                            color: '#666',
                            textAlign: 'center',
                            marginBottom: 25
                        }}>
                            ଆପଣ ନିଶ୍ଚିତ ଭାବେ ଏହାକୁ ଡିଲିଟ୍‍ କରିବାକୁ ଚାହାଁଛନ୍ତି କି?
                        </Text>

                        <TouchableOpacity
                            onPress={handleDeleteHundi}
                            style={{
                                width: '100%',
                                backgroundColor: '#B7070A',
                                paddingVertical: 12,
                                borderRadius: 10,
                                marginBottom: 12,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                ଡିଲିଟ୍‍ କରନ୍ତୁ
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setDeleteModalVisible(false)}
                            style={{
                                width: '100%',
                                paddingVertical: 12,
                                borderRadius: 10,
                                borderWidth: 1.5,
                                borderColor: '#B7070A',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#B7070A', fontSize: 16 }}>
                                ବାତିଲ୍‍ କରନ୍ତୁ
                            </Text>
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
        backgroundColor: '#f9f9f9',
        padding: 15
    },
    header: {
        backgroundColor: '#B7070A',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 12
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        elevation: 3
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    cardDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444'
    },
    cardText: {
        fontSize: 14,
        color: '#666',
        marginTop: 3
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalBox: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 14,
        padding: 20
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#B7070A'
    },
    label: {
        fontWeight: '600',
        marginBottom: 5,
        color: '#333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        fontSize: 15,
        color: '#333'
    },
    dateBtn: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#f1f1f1',
        alignItems: 'center'
    },
    saveBtn: {
        backgroundColor: '#B7070A',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10
    },
    cancelBtn: {
        alignItems: 'center',
        padding: 8
    }
});
