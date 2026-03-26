import {View,Text,StyleSheet,FlatList,TouchableOpacity,ActivityIndicator,Alert,Modal,KeyboardAvoidingView,Platform,ScrollView,TextInput,} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'https://docket-backend-tcg1cp-production.up.railway.app/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const daysUntil = (dateString) => {
  if (!dateString) return '—';
  const today = new Date();
  const hearing = new Date(dateString);
  const diff = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Today';
  return `${diff}d`;
};


const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};


const getTodayString = () => new Date().toISOString().split('T')[0];


const isThisWeek = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  const hearing = new Date(dateString);
  const diff = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= 7;
};


const getUrgencyColor = (urgency) => {
  if (urgency === 'Red')    return { bar: '#EF4444', badge: '#3B0A0A', text: '#EF4444', label: 'Urgent' };
  if (urgency === 'Orange') return { bar: '#F97316', badge: '#2D1B00', text: '#F97316', label: 'Soon' };
  return                           { bar: '#22C55E', badge: '#052E16', text: '#22C55E', label: 'Upcoming' };
};

function HearingCard({ item }) {
  const colors = getUrgencyColor(item.urgency);
  const days   = daysUntil(item.hearing_date);

  return (
    <View style={styles.card}>
  
      <View style={[styles.leftBar, { backgroundColor: colors.bar }]} />

      <View style={styles.cardMiddle}>
        <Text style={styles.cardTitle}>{item.case_id}</Text>
        <Text style={styles.cardCourt}>{item.court_name || 'Court TBC'}</Text>
        {item.hearing_time && (
          <Text style={styles.cardClient}>
            🕐 {item.hearing_time}
          </Text>
        )}
        {item.notes && (
          <Text style={styles.cardNotes} numberOfLines={1}>
            {item.notes}
          </Text>
        )}
      </View>

      <View style={styles.cardRight}>
        <Text style={[styles.daysText, { color: colors.text }]}>
          🗓 {days}
        </Text>
        <Text style={styles.dateText}>{formatDate(item.hearing_date)}</Text>
        <View style={[styles.badge, { backgroundColor: colors.badge }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {colors.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

function AddHearingModal({ visible, onClose, onSuccess }) {
  const [caseId, setCaseId]         = useState('');
  const [hearingDate, setHearingDate] = useState(getTodayString());
  const [hearingTime, setHearingTime] = useState('');
  const [courtName, setCourtName]   = useState('');
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleClose = () => {
    setCaseId(''); setHearingDate(getTodayString());
    setHearingTime(''); setCourtName(''); setNotes('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!caseId || !hearingDate) {
      Alert.alert('Error', 'Case ID and hearing date are required.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(hearingDate)) {
      Alert.alert('Error', 'Date must be in YYYY-MM-DD format e.g. 2026-04-15');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');

      const body = {
        case_id: caseId.trim().toUpperCase(),
        hearing_date: hearingDate.trim(),
      };
      if (hearingTime.trim())  body.hearing_time = hearingTime.trim();
      if (courtName.trim())    body.court_name   = courtName.trim();
      if (notes.trim())        body.notes        = notes.trim();

      const response = await fetch(`${API_URL}/hearings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('Hearing response:', data); 

      if (data.success) {
        Alert.alert('Success', 'Hearing scheduled successfully!');
        handleClose();
        onSuccess();
      } else {
    
        Alert.alert(
          'Failed',
          data.message || data.errors?.[0]?.message || 'Could not schedule hearing.'
        );
      }
    } catch (err) {
      console.log('Hearing error:', err); 
      Alert.alert('Error', 'Could not connect to the server. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalBox}>
          <ScrollView showsVerticalScrollIndicator={false}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Hearing</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

      
            <Text style={styles.modalLabel}>CASE ID *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. SLT-001"
              placeholderTextColor="#4B5563"
              autoCapitalize="characters"
              value={caseId}
              onChangeText={setCaseId}
            />

            <Text style={styles.modalLabel}>HEARING DATE * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 2026-04-15"
              placeholderTextColor="#4B5563"
              value={hearingDate}
              onChangeText={setHearingDate}
            />


            <Text style={styles.modalLabel}>HEARING TIME (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 09:00"
              placeholderTextColor="#4B5563"
              value={hearingTime}
              onChangeText={setHearingTime}
            />

     
            <Text style={styles.modalLabel}>COURT NAME (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. High Court Lagos"
              placeholderTextColor="#4B5563"
              value={courtName}
              onChangeText={setCourtName}
            />

            <Text style={styles.modalLabel}>NOTES (optional)</Text>
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="e.g. Bring certified copies of all exhibits"
              placeholderTextColor="#4B5563"
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitBtnText}>Schedule Hearing</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


export default function Hearings() {
  const router = useRouter();

  const [allHearings, setAllHearings]   = useState([]);
  const [activeTab, setActiveTab]       = useState('all');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

 
  const loadHearings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/hearings/upcoming`, { headers });
      const data = await response.json();

      if (data.success) {
        setAllHearings(data.data || []);
      } else {
        setError(data.message || 'Failed to load hearings.');
      }
    } catch (err) {
      setError('Could not connect to the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

 
  useEffect(() => {
    loadHearings();
  }, []);


  const displayedHearings =
    activeTab === 'all'
      ? allHearings
      : allHearings.filter((h) => isThisWeek(h.hearing_date));

 
  const thisWeekCount = allHearings.filter((h) => isThisWeek(h.hearing_date)).length;

  if (error) {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadHearings} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Hearings</Text>
            
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>{thisWeekCount} this week</Text>
            </View>
          </View>

        
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                All Upcoming ({allHearings.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'week' && styles.tabButtonActive]}
              onPress={() => setActiveTab('week')}
            >
              <Text style={[styles.tabText, activeTab === 'week' && styles.tabTextActive]}>
                This Week ({thisWeekCount})
              </Text>
            </TouchableOpacity>
          </View>

         
          {displayedHearings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hearings found</Text>
              <Text style={styles.emptySubText}>
                {activeTab === 'week'
                  ? 'No hearings scheduled for this week'
                  : 'No upcoming hearings'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={displayedHearings}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <HearingCard item={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              onRefresh={loadHearings}
              refreshing={loading}
            />
          )}

        </View>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

       
        <AddHearingModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadHearings}
        />

    
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/dashboard/dashB')}>
            <Ionicons name="home-outline" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/dashboard/cases')}>
            <MaterialIcons name="cases" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Cases</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/dashboard/clients')}>
            <Ionicons name="people-outline" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Clients</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="calendar" size={22} color="#FBBF24" />
            <Text style={styles.activeTab}>Hearings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/dashboard/settings')}>
            <Ionicons name="settings-outline" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Settings</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, 
    backgroundColor: '#071426' },

  container: { flex: 1, 
    backgroundColor: '#071426',
   paddingHorizontal: 16 },
 
  centeredScreen: { flex: 1, 
    backgroundColor: '#071426', 
    justifyContent: 'center', 
    alignItems: 'center', gap: 15 },

  loadingText: { color: '#9CA3AF', fontSize: 14 },

  errorText: { color: '#EF4444', 
  fontSize: 14,
   textAlign: 'center', 
  paddingHorizontal: 30 },

  retryBtn: { backgroundColor: '#FBBF24',
   paddingHorizontal: 20, 
   paddingVertical: 10, 
   borderRadius: 8 },

  retryText: { color: '#000', 
  fontWeight: 'bold' },

  
  headerRow: {
     flexDirection: 'row', 
  alignItems: 'center', 
  marginTop: 10, 
  marginBottom: 16 },

  backButton: { marginRight: 
    10, padding: 4 },

  backArrow: { color: '#fff', fontSize: 20 },

  screenTitle: { color: '#fff',
   fontSize: 20, 
   fontWeight: 'bold', 
   flex: 1 },

  weekBadge: { 
    backgroundColor: '#3B0A0A', 
  paddingHorizontal: 10, 
  
  paddingVertical: 4, 
  borderRadius: 20 },

  weekBadgeText: { color: '#EF4444', 
  fontSize: 11, 
  fontWeight: '600' },

 
  tabRow: { flexDirection: 'row',
   backgroundColor: '#0F223A', 
   borderRadius: 10, 
   padding: 4, 
   marginBottom: 16 },

  tabButton: { flex: 1, paddingVertical: 8, 
    borderRadius: 8, 
    alignItems: 'center' },

  tabButtonActive: { backgroundColor: '#FBBF24' },

  tabText: { color: '#9CA3AF', 
  fontSize: 13, fontWeight: '500' },

  tabTextActive: { color: '#000', 
  fontWeight: '700' },
  
  card: { flexDirection: 'row', 
  backgroundColor: '#0F223A', 
  borderRadius: 10, marginBottom: 8, 
  overflow: 'hidden',
   alignItems: 'stretch' },

  leftBar: { width: 4 },

  cardMiddle: { flex: 1, padding: 12 },

  cardTitle: { color: '#fff', 
  fontSize: 13, fontWeight: '600', 
  marginBottom: 3 },

  cardCourt: { color: '#9CA3AF', 
  fontSize: 11, 
  marginBottom: 3 },

  cardClient: { color: '#9CA3AF', 
  fontSize: 11 },

  cardNotes: { color: '#6B7280', 
  fontSize: 10, marginTop: 3,
   fontStyle: 'italic' },

  cardRight: { padding: 12, 
    alignItems: 'flex-end', 
    justifyContent: 'space-between' },

  daysText: { fontSize: 12, fontWeight: '600' },

  dateText: { color: '#9CA3AF', 
  fontSize: 10, 
  marginTop: 2 },

  badge: { paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6, 
    marginTop: 4 },

  badgeText: { 
    fontSize: 10, 
    fontWeight: '600' },

  emptyContainer: { flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8 },

  emptyText: { color: '#9CA3AF', 
  fontSize: 14 },

  emptySubText: { color: '#4B5563', 
  fontSize: 12, 
  textAlign: 'center' },

  
  fab: { position: 'absolute',
   bottom: 110, 
   right: 20, 
   backgroundColor: '#FBBF24', 
  width: 52, 
  height: 52, 
  borderRadius: 24,
   alignItems: 'center', 
   justifyContent: 'center', 
   elevation: 5 },

  fabText: { color: '#000',
   fontSize: 37, 
   fontWeight: 'bold', 
   lineHeight: 30 },


  modalOverlay: { 
    flex: 1, 
    backgroundColor: '#000000AA', 
    justifyContent: 'flex-end' },

  modalBox: { 
    backgroundColor: '#0F223A', 
  borderTopLeftRadius: 20, 
  borderTopRightRadius: 20, 
  padding: 24, 
  maxHeight: '90%' },

  modalHeader: { 
    flexDirection: 'row', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: 20 },

  modalTitle: { color: '#fff', 
  fontSize: 18, 
  fontWeight: 'bold' },

  modalLabel: { color: '#99C6FF', 
  fontSize: 12, 
  marginBottom: 6,
  marginTop: 14 },

  modalInput: { 
    backgroundColor: '#071426', 
  borderRadius: 10, 
  height: 48, 
  paddingHorizontal: 12, 
  color: '#fff', 
  borderWidth: 1, 
  borderColor: '#1F2937' },

  submitBtn: { backgroundColor: '#FBBF24', 
  borderRadius: 12, 
  height: 50, 

  alignItems: 'center', 
  justifyContent: 'center', 
  marginTop: 24, 
  marginBottom: 10 },

  submitBtnText: { color: '#000', 
  fontWeight: 'bold', 
  fontSize: 15 },

  tabBar: { 
    flexDirection: 'row', 
  justifyContent: 'space-between', 
  paddingHorizontal: 16, 
  paddingVertical: 10, 
  borderTopWidth: 1, 
  
  borderColor: '#1F2937', 
  backgroundColor: '#071426' },

  tabItem: { alignItems: 'center' },

  activeTab: { color: '#FBBF24', 
  fontSize: 11, 
  marginTop: 3 },

  tab: { color: '#9CA3AF', 
  fontSize: 11, 
  marginTop: 3 },
});