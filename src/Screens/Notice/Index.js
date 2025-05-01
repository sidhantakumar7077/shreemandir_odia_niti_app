import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, StyleSheet, ToastAndroid, ScrollView, RefreshControl } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { base_url } from '../../../App';

const Index = () => {

    const [notices, setNotices] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [noticeText, setNoticeText] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editNoticeId, setEditNoticeId] = useState(null);
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [noticeStartDate, setNoticeStartDate] = useState(new Date());
    const [openEndDatePicker, setOpenEndDatePicker] = useState(false);
    const [noticeEndDate, setNoticeEndDate] = useState(new Date());

    const [refreshing, setRefreshing] = React.useState(false);
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            console.log("Refreshing Successful");
            fetchNotices();
        }, 2000);
    }, []);

    const fetchNotices = async () => {
        try {
            const response = await fetch(`${base_url}api/latest-temple-notice`);
            const result = await response.json();
            if (result.status) {
                setNotices(result.data);
                // console.log("Notices fetched successfully:", result.data);
            }
        } catch (error) {
            console.log("Fetch Notice Error:", error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSaveNotice = async () => {
        if (!noticeText || noticeText.length < 4) {
            ToastAndroid.show('Notice must be at least 4 characters.', ToastAndroid.SHORT);
            return;
        }
        if (noticeEndDate < noticeStartDate) {
            ToastAndroid.show('End date cannot be earlier than start date.', ToastAndroid.SHORT);
            return;
        }

        try {
            const endpoint = isEditMode
                ? `${base_url}api/notice/update-name`
                : `${base_url}api/save-temple-news`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: isEditMode ? editNoticeId : null,
                    notice_name: noticeText,
                    start_date: moment(noticeStartDate).format('YYYY-MM-DD'),
                    end_date: moment(noticeEndDate).format('YYYY-MM-DD'),
                }),
            });

            const result = await response.json();

            if (result.status) {
                ToastAndroid.show(isEditMode ? 'Notice updated!' : 'Notice saved!', ToastAndroid.SHORT);
                setNoticeText('');
                setIsModalVisible(false);
                setIsEditMode(false);
                setEditNoticeId(null);
                fetchNotices();
                console.log("Notice saved successfully:", result.data);
            } else {
                ToastAndroid.show('Failed to save notice.', ToastAndroid.SHORT);
                console.error("Save Notice Error:", result.message);
            }
        } catch (error) {
            console.error("Save Notice Error:", error);
            ToastAndroid.show('An error occurred.', ToastAndroid.SHORT);
        }
    };

    const handleEditNotice = (notice) => {
        setNoticeText(notice.notice_name);
        setNoticeStartDate(new Date(notice.start_date));
        setNoticeEndDate(new Date(notice.end_date));
        setEditNoticeId(notice.id);
        setIsEditMode(true);
        setIsModalVisible(true);
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedNoticeId, setSelectedNoticeId] = useState(null);

    const confirmDeleteNotice = (id) => {
        setSelectedNoticeId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${base_url}api/temple-notice/delete/${selectedNoticeId}`, {
                method: 'POST',
            });

            const result = await response.json();
            if (result.status) {
                ToastAndroid.show('Notice deleted successfully', ToastAndroid.SHORT);
                fetchNotices();
                console.log("Notice deleted successfully:", result.data);
            } else {
                ToastAndroid.show('Failed to delete notice', ToastAndroid.SHORT);
                console.log("Delete Notice Error:", result);
            }
        } catch (error) {
            console.log("Delete error:", error);
            ToastAndroid.show('Error deleting notice', ToastAndroid.SHORT);
        }
        setShowDeleteModal(false);
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.noticeCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.dateText}>{moment(item.created_at).format("DD MMM YYYY")}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => handleEditNotice(item)}>
                        <Ionicons name="create-outline" size={22} color="#B7070A" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDeleteNotice(item.id)}>
                        <Ionicons name="trash-outline" size={22} color="#B7070A" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.noticeText}>{item.notice_name}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ସୂଚନା</Text>
                <TouchableOpacity onPress={() => {
                    setNoticeText('');
                    setIsEditMode(false);
                    setIsModalVisible(true);
                }}>
                    <Ionicons name="add-circle" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Notices */}
            <FlatList
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                data={notices}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />

            {/* Add / Update Notice Modal */}
            <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalBox}>
                        <Text style={styles.modalTitle}>ସୂଚନା</Text>
                        <TextInput
                            placeholder="ଏଠାରେ ଆପଣଙ୍କର ସୂଚନା ଲେଖନ୍ତୁ..."
                            value={noticeText}
                            onChangeText={setNoticeText}
                            style={styles.input}
                            multiline
                            numberOfLines={4}
                        />
                        <Text style={styles.modalTitle}>ଆରମ୍ଭ ତାରିଖ</Text>
                        <TouchableOpacity onPress={() => setOpenStartDatePicker(true)} style={styles.dateBtn}>
                            <Text style={{ color: '#333' }}>{moment(noticeStartDate).format("DD MMM YYYY")}</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>ଶେଷ ତାରିଖ</Text>
                        <TouchableOpacity onPress={() => setOpenEndDatePicker(true)} style={styles.dateBtn}>
                            <Text style={{ color: '#333' }}>{moment(noticeEndDate).format("DD MMM YYYY")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSaveNotice} style={styles.saveBtn}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{isEditMode ? 'Update' : 'Save'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelBtn}>
                            <Text style={{ color: '#B7070A' }}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                    <DatePicker
                        modal
                        open={openStartDatePicker}
                        date={noticeStartDate}
                        mode="date"
                        onConfirm={(date) => {
                            setOpenStartDatePicker(false);
                            setNoticeStartDate(date);
                        }}
                        onCancel={() => setOpenStartDatePicker(false)}
                    />
                    <DatePicker
                        modal
                        open={openEndDatePicker}
                        date={noticeEndDate}
                        mode="date"
                        onConfirm={(date) => {
                            setOpenEndDatePicker(false);
                            setNoticeEndDate(date);
                        }}
                        onCancel={() => setOpenEndDatePicker(false)}
                    />
                </View>
            </Modal>

            {/* Delete Notice Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.4)'
                }}>
                    <View style={{
                        width: '85%',
                        backgroundColor: '#fff',
                        borderRadius: 14,
                        padding: 20,
                        elevation: 8
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: '#B7070A',
                            marginBottom: 10
                        }}>
                            Confirm Deletion
                        </Text>
                        <Text style={{
                            fontSize: 15,
                            color: '#333',
                            marginBottom: 25,
                            lineHeight: 22
                        }}>
                            Are you sure you want to deactive this notice?
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity
                                onPress={() => setShowDeleteModal(false)}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 18,
                                    borderRadius: 6,
                                    backgroundColor: '#ccc',
                                    marginRight: 10
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDelete}
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 18,
                                    borderRadius: 6,
                                    backgroundColor: '#B7070A'
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
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
        backgroundColor: '#f8f8f8',
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
    noticeCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 2
    },
    noticeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#444',
        marginTop: 6
    },
    dateText: {
        fontSize: 13,
        color: '#777'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalBox: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 14,
        padding: 20,
        top: '20%'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#B7070A'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        fontSize: 15,
        textAlignVertical: 'top'
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
        padding: 10
    }
});
