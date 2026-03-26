import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://docket-backend-tcg1cp-production.up.railway.app/api';


const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const formatRole = (role) => {
  if (!role) return '';
  return role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
};


const urgencyColor = (urgency) => {
  if (urgency === 'Red') return '#EF4444';
  if (urgency === 'Orange') return '#F97316';
  return '#22C55E';
};

const daysUntil = (dateString) => {
  const today = new Date();
  const hearing = new Date(dateString);
  const diff = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 d';
  return `${diff} d`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};


function HearingItem({ item }) {
  const color = urgencyColor(item.urgency);
  return (
    <View style={styles.hearingItem}>
      <View style={[styles.leftBar, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.hearingTitle}>{item.case_id}</Text>
        <Text style={styles.sub}>{item.court_name || 'Court TBC'}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.days, { color }]}>{daysUntil(item.hearing_date)}</Text>
        <Text style={styles.date}>{formatDate(item.hearing_date)}</Text>
      </View>
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();

 
  const [user, setUser] = useState(null);


  const [stats, setStats] = useState(null);

  
  const [hearings, setHearings] = useState([]);

  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {

      const headers = await getAuthHeaders();

      const userString = await AsyncStorage.getItem('user');
      if (userString) setUser(JSON.parse(userString));

    
      const [statsRes, hearingsRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`, { headers }),
        fetch(`${API_URL}/dashboard/upcoming-hearings`, { headers }),
      ]);

      const statsData = await statsRes.json();
      const hearingsData = await hearingsRes.json();

      if (statsData.success) setStats(statsData.data);


      if (hearingsData.success) {
        setHearings(hearingsData.data || []);
      }

    } catch (err) {
      setError('Could not load dashboard. Check your connection.');
    } finally {
      setLoading(false);
    }
  };
 
  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadDashboard} style={styles.retryBtn}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>

          <ScrollView showsVerticalScrollIndicator={false}>

   
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>
              {user ? user.full_name : 'Lawyer'}
            </Text>
            <Text style={styles.badge}>
              {user ? formatRole(user.role) : ''}
            </Text>

            
            <View style={styles.row}>
              <View style={[styles.card, { backgroundColor: '#0F2A44' }]}>
                <Text style={styles.cardNumber}>
                  {stats ? stats.total : '—'}
                </Text>
                <Text style={styles.cardLabel}>All Cases</Text>
              </View>

              <View style={[styles.card, { backgroundColor: '#3B0A0A' }]}>
                <Text style={styles.cardNumber}>
                  {stats ? (stats.by_status?.Urgent || 0) : '—'}
                </Text>
                <Text style={styles.cardLabel}>Urgent</Text>
              </View>

              <View style={[styles.card, { backgroundColor: '#3B1F0A' }]}>
                <Text style={styles.cardNumber}>
                  {stats ? (stats.by_status?.['In Review'] || 0) : '—'}
                </Text>
                <Text style={styles.cardLabel}>In Review</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Hearings</Text>
              <TouchableOpacity onPress={() => router.push('/dashboard/hearings')}>
                <Text style={styles.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>

            {hearings.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming hearings</Text>
            ) : (
              <FlatList
                data={hearings.slice(0, 4)} 
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <HearingItem item={item} />}
                scrollEnabled={false} 
              />
            )}

            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
              Case Overview
            </Text>

            <View style={styles.row}>
              <View style={[styles.overviewCard, { backgroundColor: '#1F3D2B' }]}>
                <Text style={styles.overviewLabel}>Active</Text>
                <Text style={styles.overviewNumber}>
                  {stats ? (stats.by_status?.Active || 0) : '—'}
                </Text>
              </View>
              <View style={[styles.overviewCard, { backgroundColor: '#3B1F0A' }]}>
                <Text style={styles.overviewLabel}>Pending</Text>
                <Text style={styles.overviewNumber}>
                  {stats ? (stats.by_status?.Pending || 0) : '—'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.outlineCard}>
                <Text style={styles.outlineLabel}>In Review</Text>
                <Text style={styles.outlineNumber}>
                  {stats ? (stats.by_status?.['In Review'] || 0) : '—'}
                </Text>
              </View>
              <View style={styles.outlineCard}>
                <Text style={styles.outlineLabel}>Closed</Text>
                <Text style={styles.outlineNumber}>
                  {stats ? (stats.by_status?.Closed || 0) : '—'}
                </Text>
              </View>
            </View>

          </ScrollView>

          <View style={styles.tabBar}>
            <TouchableOpacity style={{ alignItems: 'center' }}>
              <Ionicons name="home" size={24} color="#FBBF24" />
              <Text style={styles.activeTab}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/dashboard/cases')}
              style={{ alignItems: 'center' }}
            >
              <View style={{ position: 'relative' }}>
                <MaterialIcons name="cases" size={24} color="white" />
                
                {stats?.by_status?.Urgent > 0 && (
                  <View style={styles.badge2}>
                    <Text style={styles.badgeText}>
                      {stats.by_status.Urgent}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.tab}>Cases</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/dashboard/clients')}
              style={{ alignItems: 'center' }}
            >
              <Ionicons name="people" size={24} color="white" />
              <Text style={styles.tab}>Clients</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/dashboard/hearings')}
              style={{ alignItems: 'center' }}
            >
              <View style={{ position: 'relative' }}>
                <Feather name="calendar" size={24} color="white" />
              
                {hearings.filter((h) => h.urgency === 'Red').length > 0 && (
                  <View style={styles.badge2}>
                    <Text style={styles.badgeText}>
                      {hearings.filter((h) => h.urgency === 'Red').length}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.tab}>Hearings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: 'center' }}
              onPress={() => router.push('/dashboard/settings')}
            >
              <Ionicons name="settings-outline" size={22} color="#9CA3AF" />
              <Text style={styles.tab}>Settings</Text>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071426',
    padding: 20,
    paddingTop: 40,
  },
 
  loadingContainer: {
    flex: 1,
    backgroundColor: '#071426',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },

  loadingText: { 
    color: '#9CA3AF', 
  fontSize: 14 },

  errorText: { 
    color: '#EF4444', 
  fontSize: 14, 
  textAlign: 'center', 
  paddingHorizontal: 30 },

  retryBtn: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryText: {
     color: '#000', 
  fontWeight: 'bold' },

  emptyText: { color: '#6B7280', 
  fontSize: 13, 
  marginBottom: 10 },
 
  greeting: { 
    color: '#6B7280', 
  fontSize: 15, 
  paddingBottom: 5 },

  name: { color: '#fff', 
  fontSize: 20, 
  fontWeight: 'bold',
   paddingBottom: 5 },

  badge: {
    backgroundColor: '#FBBF24',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 10,
    marginBottom: 10,
  },
 
  row: { flexDirection: 'row',
   gap: 10, marginVertical: 10 },

  card: { flex: 1, padding: 12, 
    borderRadius: 10 },

  cardNumber: { color: '#fff',
   fontWeight: 'bold', fontSize: 18 },

  cardLabel: { color: '#9CA3AF',
   fontSize: 11 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: { color: '#fff', 
  fontSize: 14, 
  marginBottom: 5 },

  seeAll: { color: '#FBBF24', fontSize: 12 },

  hearingItem: {
    flexDirection: 'row',
    backgroundColor: '#0F223A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  leftBar: { width: 4, 
    height: '100%',
     marginRight: 10, 
    borderRadius: 2 },

  hearingTitle: { color: '#fff',
   fontSize: 13 },

  sub: { color: '#9CA3AF',
   fontSize: 11 },

  days: { fontSize: 12,
     fontWeight: 'bold' },

  date: { color: '#9CA3AF',
   fontSize: 10 },
 
  overviewCard: { flex: 1, 
    padding: 15, 
    borderRadius: 10 
  },

  overviewLabel: { color: '#D1D5DB',
   fontSize: 12 },

  overviewNumber: { color: '#fff',
   fontSize: 18, 
   fontWeight: 'bold' 
  },

  outlineCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  outlineLabel: { color: '#9CA3AF',
   fontSize: 12 },

  outlineNumber: { color: '#fff', 
  fontSize: 16 },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#1F2937',
    paddingBottom: 5,
  },
  activeTab: { color: '#FBBF24', 
  fontSize: 12 },

  tab: { 
    color: '#9CA3AF', 
  fontSize: 12 },
  
  badge2: {
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
  badgeText: { color: '#fff', 
  fontSize: 10, 
  fontWeight: 'bold' },
});