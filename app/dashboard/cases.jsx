import {View,Text,StyleSheet,FlatList,TouchableOpacity, TextInput, ActivityIndicator, Alert,} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'https://docket-backend-tcg1cp-production.up.railway.app/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};


function getStatusColor(status) {
  if (status === 'Urgent')    return { bg: '#3B0A0A', text: '#EF4444' };
  if (status === 'Active')    return { bg: '#052E16', text: '#22C55E' };
  if (status === 'Pending')   return { bg: '#2D1B00', text: '#F97316' };
  if (status === 'In Review') return { bg: '#1E3A5F', text: '#60A5FA' };
  if (status === 'Closed')    return { bg: '#1F2937', text: '#9CA3AF' };
  return { bg: '#1F2937', text: '#9CA3AF' };
}


const daysSinceFiled = (filedDate) => {
  if (!filedDate) return '—';
  const filed = new Date(filedDate);
  const today = new Date();
  const diff = Math.floor((today - filed) / (1000 * 60 * 60 * 24));
  return `${diff}d`;
};


function CaseCard({ item }) {
  const statusColor = getStatusColor(item.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
      
        <Text style={styles.caseId}>
          {item.id}.{' '}
          <Text style={styles.category}>{item.case_type}</Text>
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {item.status}
          </Text>
        </View>
      </View>


      <Text style={styles.caseTitle}>{item.title}</Text>

      <View style={styles.cardBottomRow}>
       
        <Text style={styles.clientName}>
          {item.client ? item.client.full_name : 'Client TBC'}
        </Text>

    
        <View style={styles.daysRow}>
          <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
          <Text style={styles.daysText}> {daysSinceFiled(item.filed_date)}</Text>
        </View>
      </View>
    </View>
  );
}

const filters = ['All', 'Urgent', 'Active', 'Pending', 'In Review', 'Closed'];

export default function Cases() {
  const router = useRouter();

  const [allCases, setAllCases] = useState([]);      
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/cases`, { headers });
      const data = await response.json();

      if (data.success) {
        setAllCases(data.data || []);
      } else {
        setError(data.message || 'Failed to load cases.');
      }
    } catch (err) {
      setError('Could not connect to the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, []);

  const filteredCases = allCases.filter((c) => {

    const matchesFilter = activeFilter === 'All' || c.status === activeFilter;

    const clientName = c.client ? c.client.full_name.toLowerCase() : '';
    const matchesSearch =
      c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      clientName.includes(searchText.toLowerCase()) ||
      c.id.toLowerCase().includes(searchText.toLowerCase());

    return matchesFilter && matchesSearch;
  });


  if (error) {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadCases} style={styles.retryBtn}>
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Cases</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {filteredCases.length} of {allCases.length}
              </Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cases, clients, IDs..."
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

    
          <FlatList
            horizontal
            data={filters}
            keyExtractor={(f) => f}
            showsHorizontalScrollIndicator={false}
            style={{ maxHeight: 40, marginBottom: 14 }}
            renderItem={({ item: filter }) => (
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  activeFilter === filter && styles.filterTabActive,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === filter && styles.filterTabTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            )}
          />

          {filteredCases.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No cases found</Text>
              <Text style={styles.emptySubText}>
                Try a different filter or search term
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredCases}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <CaseCard item={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
        
              onRefresh={loadCases}
              refreshing={loading}
            />
          )}

        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/dashboard/dashB')}
          >
            <Ionicons name="home-outline" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem}>
            <MaterialIcons name="cases" size={22} color="#FBBF24" />
            <Text style={styles.activeTab}>Cases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/dashboard/clients')}
          >
            <Ionicons name="people-outline" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Clients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/dashboard/hearings')}
          >
            
            <View style={{ position: 'relative' }}>
              <Ionicons name="calendar-outline" size={22} color="#9CA3AF" />
              {allCases.filter((c) => c.status === 'Urgent').length > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifText}>
                    {allCases.filter((c) => c.status === 'Urgent').length}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.tab}>Hearings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.push('/dashboard/settings')}
          >
            <Ionicons name="settings-outline" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Settings</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#071426',
  },
  container: {
    flex: 1,
    backgroundColor: '#071426',
    paddingHorizontal: 16,
  },

  centeredScreen: {
    flex: 1,
    backgroundColor: '#071426',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  loadingText: { color: '#9CA3AF', fontSize: 14 },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  retryBtn: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#000', fontWeight: 'bold' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  backButton: { marginRight: 10, padding: 4 },
  backArrow: { color: '#fff', fontSize: 20 },
  screenTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#0F223A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countBadgeText: { color: '#9CA3AF', fontSize: 11 },
 
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F223A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    marginLeft: 8,
  },

  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0F223A',
    marginRight: 8,
  },
  filterTabActive: { backgroundColor: '#FBBF24' },
  filterTabText: { color: '#9CA3AF', fontSize: 12 },
  filterTabTextActive: { color: '#000', fontWeight: '700' },

  card: {
    backgroundColor: '#0F223A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  caseId: { color: '#9CA3AF', fontSize: 11 },
  category: { color: '#FBBF24', fontSize: 11 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: '600' },
  caseTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientName: { color: '#9CA3AF', fontSize: 12 },
  daysRow: { flexDirection: 'row', alignItems: 'center' },
  daysText: { color: '#9CA3AF', fontSize: 12 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  emptySubText: { color: '#4B5563', fontSize: 12 },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#071426',
  },
  tabItem: { alignItems: 'center' },
  activeTab: { color: '#FBBF24', fontSize: 11, marginTop: 3 },
  tab: { color: '#9CA3AF', fontSize: 11, marginTop: 3 },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});