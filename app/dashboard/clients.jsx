import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
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


const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const avatarColors = ['#1E3A5F', '#1F3D2B', '#3B1F0A', '#3B0A0A', '#2D1B00'];
const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
};

function ClientCard({ item }) {
  const isCorporate = item.client_type === 'corporate';
  const badgeBg   = isCorporate ? '#1E3A5F' : '#1F2937';
  const badgeText = isCorporate ? '#60A5FA' : '#9CA3AF';
  const typeLabel = isCorporate ? 'Corporate' : 'Individual';

  return (
    <View style={styles.card}>

      <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.full_name) }]}>
        <Text style={styles.avatarText}>{getInitials(item.full_name)}</Text>
      </View>

      <View style={styles.cardMiddle}>
        <Text style={styles.clientName}>{item.full_name}</Text>
        <Text style={styles.clientEmail}>{item.email}</Text>
      </View>

      <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
        <Text style={[styles.typeText, { color: badgeText }]}>{typeLabel}</Text>
      </View>
    </View>
  );
}


function AddClientModal({ visible, onClose, onSuccess }) {
  const [fullName, setFullName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [address, setAddress]       = useState('');
  const [clientType, setClientType] = useState('individual');
  const [loading, setLoading]       = useState(false);


  const handleClose = () => {
    setFullName(''); setEmail(''); setPhone('');
    setAddress(''); setClientType('individual');
    onClose();
  };


  const handleSubmit = async () => {
    if (!fullName || !email || !phone) {
      Alert.alert('Error', 'Full name, email and phone are required.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          phone: phone,
          address: address,
          client_type: clientType, 
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Client added successfully!');
        handleClose();
        onSuccess(); 
      } else {
        const errorMsg = data.errors?.map((e) => e.message).join('\n')
          || data.message
          || 'Failed to add client.';
        Alert.alert('Error', errorMsg);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to the server.');
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
              <Text style={styles.modalTitle}>Add New Client</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

        
            <Text style={styles.modalLabel}>FULL NAME *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Theresa Agbo"
              placeholderTextColor="#4B5563"
              value={fullName}
              onChangeText={setFullName}
            />

        
            <Text style={styles.modalLabel}>EMAIL *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. theresa@gmail.com"
              placeholderTextColor="#4B5563"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.modalLabel}>PHONE *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. +2348012345678"
              placeholderTextColor="#4B5563"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

        
            <Text style={styles.modalLabel}>ADDRESS (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 14 Marina Street, Lagos"
              placeholderTextColor="#4B5563"
              value={address}
              onChangeText={setAddress}
            />

        
            <Text style={styles.modalLabel}>CLIENT TYPE *</Text>
            <View style={styles.typeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.typeToggleBtn,
                  clientType === 'individual' && styles.typeToggleBtnActive,
                ]}
                onPress={() => setClientType('individual')}
              >
                <Text style={[
                  styles.typeToggleText,
                  clientType === 'individual' && styles.typeToggleTextActive,
                ]}>
                  Individual
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeToggleBtn,
                  clientType === 'corporate' && styles.typeToggleBtnActive,
                ]}
                onPress={() => setClientType('corporate')}
              >
                <Text style={[
                  styles.typeToggleText,
                  clientType === 'corporate' && styles.typeToggleTextActive,
                ]}>
                  Corporate
                </Text>
              </TouchableOpacity>
            </View>

            
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitBtnText}>Add Client</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


const filters = ['All', 'Individual', 'Corporate'];

export default function Clients() {
  const router = useRouter();

  const [allClients, setAllClients]       = useState([]);
  const [activeFilter, setActiveFilter]   = useState('All');
  const [searchText, setSearchText]       = useState('');
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [showAddModal, setShowAddModal]   = useState(false);


  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/clients`, { headers });
      const data = await response.json();

      if (data.success) {
        setAllClients(data.data || []);
      } else {
        setError(data.message || 'Failed to load clients.');
      }
    } catch (err) {
      setError('Could not connect to the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

 
  useEffect(() => {
    loadClients();
  }, []);

 
  const filteredClients = allClients.filter((c) => {
    
    const matchesFilter =
      activeFilter === 'All' ||
      c.client_type === activeFilter.toLowerCase();

    const matchesSearch =
      c.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.email.toLowerCase().includes(searchText.toLowerCase());

    return matchesFilter && matchesSearch;
  });
 
  if (error) {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadClients} style={styles.retryBtn}>
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
            <Text style={styles.screenTitle}>Clients</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{allClients.length}</Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

         
          <View style={styles.filterRow}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  activeFilter === filter && styles.filterTabActive,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === filter && styles.filterTabTextActive,
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

   
          {filteredClients.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No clients found</Text>
              <Text style={styles.emptySubText}>
                Try a different filter or search term
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ClientCard item={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              onRefresh={loadClients}
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

    
        <AddClientModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadClients} 
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

          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="people" size={22} color="#FBBF24" />
            <Text style={styles.activeTab}>Clients</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/dashboard/hearings')}>
            <Ionicons name="calendar-outline" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Hearings</Text>
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

  safeArea: { flex: 1, backgroundColor: '#071426' },

  container: { flex: 1, 
    backgroundColor: '#071426', 
    paddingHorizontal: 16, 
    marginTop: 30 
  },
 
  centeredScreen: { 
    flex: 1, 
    backgroundColor: '#071426', 
  justifyContent: 'center', 
  alignItems: 'center', 
  gap: 15 },

  loadingText: { color: '#9CA3AF', 
  fontSize: 14 },

  errorText: { color: '#EF4444', 
  fontSize: 14, 
  textAlign: 'center', 
  paddingHorizontal: 30 },

  retryBtn: { 
    backgroundColor: '#FBBF24', 
  paddingHorizontal: 20, 
  paddingVertical: 10, 
  borderRadius: 8 },

  retryText: { color: '#000', 
  fontWeight: 'bold' },

  headerRow: { flexDirection: 'row', 
  alignItems: 'center', 
  marginTop: 10, 
  marginBottom: 14 },

  backButton: { marginRight: 10,
     padding: 4 },

  backArrow: { color: '#fff',
   fontSize: 20 },

  screenTitle: { 
    color: '#fff', 
  fontSize: 20, 
  fontWeight: 'bold', 
  flex: 1 },

  countBadge: {
     backgroundColor: '#0F223A', 
     width: 60, height: 60, 
     borderRadius: 10, 
     alignItems: 'center', 
     justifyContent: 'center' 
    },

  countBadgeText: { color: '#9CA3AF', 
  fontSize: 19, 
  fontWeight: '600' },
 
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F223A', 
    borderRadius: 10,
     paddingHorizontal: 12,
      paddingVertical: 10, 
      marginBottom: 12 },
  searchInput: { flex: 1, 
    color: '#fff', 
    fontSize: 13, 
    marginLeft: 8 },
 
  filterRow: { 
    flexDirection: 'row', 
  gap: 8, 
  marginBottom: 14 },

  filterTab: { 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20, 
    backgroundColor: '#0F223A' },

  filterTabActive: { backgroundColor: '#FBBF24' },

  filterTabText: { color: '#9CA3AF',
   fontSize: 12 },

  filterTabTextActive: { color: '#000', 
  fontWeight: '700' },

  card: { 
    flexDirection: 'row',
     alignItems: 'center',
      backgroundColor: '#0F223A', 
      borderRadius: 12, 
      borderColor: 'white', 
      borderWidth: 1, 
      padding: 14, 
      marginBottom: 18 },

  avatar: { width: 49, 
    height: 49, 
    borderRadius: 12,
     borderColor: 'white', 
     borderWidth: 1, 
     alignItems: 'center', 
     justifyContent: 'center', 
     marginRight: 12 },

  avatarText: { color: '#fff', 
  fontSize: 14, 
  fontWeight: 'bold' },

  cardMiddle: { flex: 1 },

  clientName: { color: '#fff', 
  fontSize: 14, fontWeight: '600', 
  marginBottom: 3 },

  clientEmail: { color: '#9CA3AF',
   fontSize: 11 },
  
  typeBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8 },

  typeText: { 
    fontSize: 10, 
    fontWeight: '600' },
  
  emptyContainer: {
     flex: 1,
      justifyContent: 'center',
       alignItems: 'center', 
       gap: 8 
      },

  emptyText: {
     color: '#9CA3AF',
   fontSize: 14 },

  emptySubText: {
     color: '#4B5563', 
     fontSize: 12
     },

  fab: {
     position: 'absolute', 
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
    justifyContent: 'flex-end'
   },

  modalBox: {
     backgroundColor: '#0F223A', 
     borderTopLeftRadius: 20, 
     borderTopRightRadius: 20, 
     padding: 24, 
     maxHeight: '85%' },

  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 },

  modalTitle: {
     color: '#fff', 
     fontSize: 18, 
     fontWeight: 'bold'
     },

  modalLabel: { 
    color: '#99C6FF',
   fontSize: 12,
    marginBottom: 6,
     marginTop: 14
     },

  modalInput: {
     backgroundColor: '#071426', 
     borderRadius: 10,
      height: 48, 
      paddingHorizontal: 12, 
      color: '#fff', 
      borderWidth: 1, 
      borderColor: '#1F2937' 
    },
  
  typeToggleRow: { 
    flexDirection: 'row',
     gap: 12, 
     marginTop: 4 
    },
  
  typeToggleBtn: {
     flex: 1, 
     paddingVertical: 10, 
     borderRadius: 10, 
     backgroundColor: '#071426', 
     alignItems: 'center', 
     borderWidth: 1, 
     borderColor: '#1F2937' 
    },
  
  typeToggleBtnActive: {
     backgroundColor: '#FBBF24',
      borderColor: '#FBBF24'
     },

  typeToggleText: { 
    color: '#9CA3AF', 
  fontSize: 13
 },

  typeToggleTextActive: { 
    color: '#000', 
  fontWeight: 'bold' },

  submitBtn: { 
    backgroundColor: '#FBBF24', 
    borderRadius: 12, 
    height: 50, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 24, 
    marginBottom: 10 
  },
 
  submitBtnText: {
     color: '#000', 
     fontWeight: 'bold',
      fontSize: 15 
    },

  tabBar: { 
    flexDirection: 'row', 
  justifyContent: 'space-between', 
  paddingHorizontal: 16,
   paddingVertical: 10,
    borderTopWidth: 1,
     borderColor: '#1F2937', 
     backgroundColor: '#071426'
     },

  tabItem: { alignItems: 'center' },

  activeTab: {
     color: '#FBBF24', 
     fontSize: 11, 
     marginTop: 3 },

  tab: {
     color: '#9CA3AF', 
     fontSize: 11, 
     marginTop: 3 },


  notifBadge: { 
    position: 'absolute', 
    top: -4, 
    right: -6, 
    backgroundColor: '#EF4444', 
    borderRadius: 10, 
    width: 16, 
    height: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },

  notifText: {
     color: '#fff',
   fontSize: 10,
   fontWeight: 'bold' },
});