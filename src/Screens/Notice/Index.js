import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    StyleSheet,
    ToastAndroid,
    ScrollView,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { base_url } from '../../../App';

const Index = () => {
    const [notices, setNotices] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [noticeText, setNoticeText] = useState('');
    const [englisgNoticeText, setEnglishNoticeText] = useState('');
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
            fetchNotices();
        }, 1200);
    }, []);

    const fetchNotices = async () => {
        try {
            const response = await fetch(`${base_url}api/latest-temple-notice`);
            const result = await response.json();
            if (result.status) {
                setNotices(result.data);
            }
        } catch (error) {
            console.log('Fetch Notice Error:', error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleSaveNotice = async () => {
        const token = await AsyncStorage.getItem('storeAccesstoken');

        if (!noticeText || noticeText.length < 4) {
            ToastAndroid.show(
                'Notice must be at least 4 characters.',
                ToastAndroid.SHORT
            );
            return;
        }
        if (!englisgNoticeText || englisgNoticeText.length < 4) {
            ToastAndroid.show(
                'English notice must be at least 4 characters.',
                ToastAndroid.SHORT
            );
            return;
        }
        if (noticeEndDate < noticeStartDate) {
            ToastAndroid.show(
                'End date cannot be earlier than start date.',
                ToastAndroid.SHORT
            );
            return;
        }

        try {
            const endpoint = isEditMode
                ? `${base_url}api/notice/update-name`
                : `${base_url}api/save-temple-news`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: isEditMode ? editNoticeId : null,
                    notice_name: noticeText,
                    notice_name_english: englisgNoticeText,
                    start_date: moment(noticeStartDate).format('YYYY-MM-DD'),
                    end_date: moment(noticeEndDate).format('YYYY-MM-DD'),
                }),
            });

            const result = await response.json();

            if (result.status) {
                ToastAndroid.show(
                    isEditMode ? 'Notice updated!' : 'Notice saved!',
                    ToastAndroid.SHORT
                );
                setNoticeText('');
                setEnglishNoticeText('');
                setIsModalVisible(false);
                setIsEditMode(false);
                setEditNoticeId(null);
                setNoticeStartDate(new Date());
                setNoticeEndDate(new Date());
                fetchNotices();
            } else {
                ToastAndroid.show('Failed to save notice.', ToastAndroid.SHORT);
                console.error('Save Notice Error:', result.message);
            }
        } catch (error) {
            console.error('Save Notice Error:', error);
            ToastAndroid.show('An error occurred.', ToastAndroid.SHORT);
        }
    };

    const handleEditNotice = (notice) => {
        const today = new Date();

        setNoticeText(notice.notice_name);
        setEnglishNoticeText(notice.notice_name_english);
        setNoticeStartDate(notice.start_date ? new Date(notice.start_date) : today);
        setNoticeEndDate(notice.end_date ? new Date(notice.end_date) : today);
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
            const response = await fetch(
                `${base_url}api/temple-notice/delete/${selectedNoticeId}`,
                {
                    method: 'POST',
                }
            );

            const result = await response.json();
            if (result.status) {
                ToastAndroid.show(
                    'Notice deleted successfully',
                    ToastAndroid.SHORT
                );
                fetchNotices();
            } else {
                ToastAndroid.show('Failed to delete notice', ToastAndroid.SHORT);
                console.log('Delete Notice Error:', result);
            }
        } catch (error) {
            console.log('Delete error:', error);
            ToastAndroid.show('Error deleting notice', ToastAndroid.SHORT);
        }
        setShowDeleteModal(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setNoticeStartDate(new Date());
        setNoticeEndDate(new Date());
        setIsEditMode(false);
        setEditNoticeId(null);
    };

    const renderItem = ({ item }) => (
        <View style={styles.noticeCard}>
            <View style={styles.noticeHeaderRow}>
                <View>
                    <Text style={styles.dateText}>
                        {moment(item.created_at).format('DD MMM YYYY')}
                    </Text>
                    {item.start_date && item.end_date && (
                        <Text style={styles.rangeText}>
                            {moment(item.start_date).format('DD MMM')} -{' '}
                            {moment(item.end_date).format('DD MMM')}
                        </Text>
                    )}
                </View>
                <View style={styles.noticeActions}>
                    <TouchableOpacity onPress={() => handleEditNotice(item)}>
                        <Ionicons name="create-outline" size={22} color="#B7070A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => confirmDeleteNotice(item.id)}
                        style={{ marginLeft: 10 }}
                    >
                        <Ionicons name="trash-outline" size={22} color="#B7070A" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.noticeText}>{item.notice_name}</Text>
            <Text style={styles.noticeSubText}>{item.notice_name_english}</Text>
            <View style={styles.metaRow}>
                <Text style={styles.metaText}>Added by: {item.notice_insert_user_id}</Text>
                {item.notice_update_user_id && (
                    <Text style={styles.metaText}>
                        Updated by: {item.notice_update_user_id}
                    </Text>
                )}
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
                        <Text style={styles.headerTitle}>ସୂଚନା</Text>
                        <Text style={styles.headerSubtitle}>
                            ମନ୍ଦିର ସମ୍ପର୍କିତ ସମସ୍ତ ନବୀନତମ ସୂଚନା
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            setNoticeText('');
                            setEnglishNoticeText('');
                            setIsEditMode(false);
                            setIsModalVisible(true);
                        }}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </LinearGradient>

                {/* List header info */}
                <View style={styles.listInfoRow}>
                    <Text style={styles.listInfoText}>
                        Total Notices:{' '}
                        <Text style={styles.listInfoCount}>{notices.length}</Text>
                    </Text>
                </View>

                {/* Notices */}
                <FlatList
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    data={notices}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 12 }}
                />

                {/* Add / Update Notice Modal */}
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
                                                <Ionicons name="document-text-outline" size={20} color="#B7070A" />
                                            </View>
                                            <View>
                                                <Text style={styles.modalTitle}>
                                                    {isEditMode ? 'Edit Notice' : 'New Notice'}
                                                </Text>
                                                <Text style={styles.modalSubtitle}>
                                                    Fill the details and save the temple notice.
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={handleCancel}>
                                            <Ionicons name="close" size={22} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.fieldLabel}>ସୂଚନା</Text>
                                    <TextInput
                                        placeholder="ଏଠାରେ ଆପଣଙ୍କର ସୂଚନା ଲେଖନ୍ତୁ..."
                                        value={noticeText}
                                        onChangeText={setNoticeText}
                                        style={styles.input}
                                        multiline
                                        numberOfLines={4}
                                    />

                                    <Text style={styles.fieldLabel}>ଇଂରାଜୀ ସୂଚନା</Text>
                                    <TextInput
                                        placeholder="Write your notice here..."
                                        value={englisgNoticeText}
                                        onChangeText={setEnglishNoticeText}
                                        style={styles.input}
                                        multiline
                                        numberOfLines={4}
                                    />

                                    <View style={styles.dateRow}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={styles.fieldLabel}>ଆରମ୍ଭ ତାରିଖ</Text>
                                            <TouchableOpacity
                                                onPress={() => setOpenStartDatePicker(true)}
                                                style={styles.dateBtn}
                                            >
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={18}
                                                    color="#B7070A"
                                                    style={{ marginRight: 6 }}
                                                />
                                                <Text style={styles.dateTextBtn}>
                                                    {moment(noticeStartDate).format('DD MMM YYYY')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text style={styles.fieldLabel}>ଶେଷ ତାରିଖ</Text>
                                            <TouchableOpacity
                                                onPress={() => setOpenEndDatePicker(true)}
                                                style={styles.dateBtn}
                                            >
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={18}
                                                    color="#B7070A"
                                                    style={{ marginRight: 6 }}
                                                />
                                                <Text style={styles.dateTextBtn}>
                                                    {moment(noticeEndDate).format('DD MMM YYYY')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleSaveNotice}
                                        style={styles.saveBtnWrapper}
                                    >
                                        <LinearGradient
                                            colors={['#f97316', '#facc15']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.saveBtn}
                                        >
                                            <Text style={styles.saveBtnText}>
                                                {isEditMode ? 'Update Notice' : 'Save Notice'}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </LinearGradient>
                        </View>

                        {/* Date Pickers */}
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
                    <View style={styles.deleteOverlay}>
                        <View style={styles.deleteBox}>
                            <View style={styles.deleteIconCircle}>
                                <Ionicons name="trash-outline" size={28} color="#B7070A" />
                            </View>
                            <Text style={styles.deleteTitle}>Confirm Deletion</Text>
                            <Text style={styles.deleteMessage}>
                                Are you sure you want to deactive this notice?
                            </Text>

                            <View style={styles.deleteButtonRow}>
                                <TouchableOpacity
                                    onPress={() => setShowDeleteModal(false)}
                                    style={styles.deleteCancelBtn}
                                >
                                    <Text style={styles.deleteCancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={styles.deleteConfirmBtn}
                                >
                                    <Text style={styles.deleteConfirmText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
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
        padding: 14,
    },
    header: {
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        elevation: 6,
    },
    headerTitle: {
        fontSize: 22,
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
    listInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    listInfoText: {
        fontSize: 12,
        color: '#fef9c3',
    },
    listInfoCount: {
        fontWeight: '700',
    },
    noticeCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#B7070A',
    },
    noticeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noticeActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#6b7280',
    },
    rangeText: {
        fontSize: 11,
        color: '#9ca3af',
        marginTop: 2,
    },
    noticeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2933',
        marginTop: 8,
    },
    noticeSubText: {
        fontSize: 14,
        color: '#4b5563',
        marginTop: 4,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    metaText: {
        fontSize: 11,
        color: '#9ca3af',
    },

    /* -------- Add / Update Modal styles -------- */
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalContainer: {
        width: '92%',
        maxHeight: '85%',
        borderRadius: 22,
        overflow: 'hidden',
        elevation: 10,
    },
    modalGradient: {
        // flex: 1,
    },
    modalContent: {
        padding: 18,
        paddingBottom: 22,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4b5563',
        marginBottom: 4,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 10,
        marginBottom: 6,
        fontSize: 14,
        textAlignVertical: 'top',
        backgroundColor: '#f9fafb',
    },
    dateRow: {
        flexDirection: 'row',
        marginTop: 6,
        marginBottom: 12,
    },
    dateBtn: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f9fafb',
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTextBtn: {
        fontSize: 13,
        color: '#374151',
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
        paddingVertical: 8,
        marginTop: 4,
    },
    cancelText: {
        color: '#B7070A',
        fontWeight: '500',
    },

    /* -------- Delete Modal styles -------- */
    deleteOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    deleteBox: {
        width: '82%',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        elevation: 8,
        alignItems: 'center',
    },
    deleteIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    deleteTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#B7070A',
        marginBottom: 6,
    },
    deleteMessage: {
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
        marginBottom: 22,
    },
    deleteButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    deleteCancelBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#e5e7eb',
        marginRight: 8,
        alignItems: 'center',
    },
    deleteConfirmBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#B7070A',
        marginLeft: 8,
        alignItems: 'center',
    },
    deleteCancelText: {
        color: '#374151',
        fontWeight: '600',
    },
    deleteConfirmText: {
        color: '#fff',
        fontWeight: '600',
    },
});