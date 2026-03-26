import {View, Text,StyleSheet, FlatList, TouchableOpacity, Switch, ActivityIndicator, Alert,} from 'react-native';
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

const formatRole = (role) => {
  if (!role) return 'Unknown';
  return role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const avatarColors = ['#1E3A5F', '#1F3D2B', '#3B1F0A', '#2D1B69', '#3B0A0A'];
const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
};

function MemberCard({ item, onToggle, toggling }) {
  return (
    <View style={styles.memberCard}>

      <View style={styles.memberTop}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.full_name) }]}>
          <Text style={styles.avatarText}>{getInitials(item.full_name)}</Text>
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.full_name}</Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          {item.specialty && (
            <Text style={styles.memberSpecialty}>{item.specialty}</Text>
          )}
        </View>

        {toggling === item.id ? (
          <ActivityIndicator size="small" color="#FBBF24" />
        ) : (
          <Switch
            value={item.is_active}
            onValueChange={() => onToggle(item.id, item.is_active)}
            trackColor={{ false: '#1F2937', true: '#FBBF24' }}
            thumbColor={item.is_active ? '#fff' : '#9CA3AF'}
          />
        )}
      </View>

      <View style={styles.memberBottom}>
        <View style={[
          styles.roleBadge,
          item.role === 'senior_partner' && { backgroundColor: '#1E3A5F' },
          item.role === 'associate'      && { backgroundColor: '#1F3D2B' },
          item.role === 'secretary'      && { backgroundColor: '#2D1B00' },
        ]}>
          <Text style={[
            styles.roleText,
            item.role === 'senior_partner' && { color: '#60A5FA' },
            item.role === 'associate'      && { color: '#22C55E' },
            item.role === 'secretary'      && { color: '#F97316' },
          ]}>
            {formatRole(item.role)}
          </Text>
        </View>

    
        <View style={[
          styles.statusPill,
          { backgroundColor: item.is_active ? '#052E16' : '#3B0A0A' },
        ]}>
          <Text style={[
            styles.statusPillText,
            { color: item.is_active ? '#22C55E' : '#EF4444' },
          ]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

    </View>
  );
}

export default function AdminPortal() {
  const router = useRouter();

  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [toggling, setToggling] = useState(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/lawyers`, { headers });
      const data = await response.json();

      if (data.success) {
        setMembers(data.data || []);
      } else {
        setError(data.message || 'Failed to load team members.');
      }
    } catch (err) {
      setError('Could not connect to the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    const member = members.find((m) => m.id === id);

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${member?.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setToggling(id);
            try {
              const headers = await getAuthHeaders();
              const response = await fetch(
                `${API_URL}/lawyers/${id}/toggle-status`,
                {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify({ is_active: !currentStatus }), 
                }
              );
              const data = await response.json();

              if (data.success) {
                setMembers((prev) =>
                  prev.map((m) =>
                    m.id === id ? { ...m, is_active: !m.is_active } : m
                  )
                );
              } else {
                Alert.alert('Error', data.message || 'Could not update status.');
              }
            } catch (err) {
              Alert.alert('Error', 'Could not connect to the server.');
            } finally {
              setToggling(null);
            }
          },
        },
      ]
    );
  };

  const totalUsers    = members.length;
  const activeCount   = members.filter((m) => m.is_active).length;
  const inactiveCount = members.filter((m) => !m.is_active).length;


  if (error) {
    return (
      <SafeAreaView style={styles.centeredScreen}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadMembers} style={styles.retryBtn}>
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
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Admin Portal</Text>
          </View>

          <View style={styles.adminCard}>
            <View style={styles.adminIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#FBBF24" />
            </View>
            <View>
              <Text style={styles.adminTitle}>Admin Portal</Text>
              <Text style={styles.adminSubtitle}>
                Manage team access & permissions
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: '#1E3A5F' }]}>
              <Text style={styles.statNumber}>{totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#1F3D2B' }]}>
              <Text style={[styles.statNumber, { color: '#22C55E' }]}>
                {activeCount}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#3B0A0A' }]}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                {inactiveCount}
              </Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
          </View>


          <Text style={styles.sectionTitle}>Team Members</Text>

          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MemberCard
                item={item}
                onToggle={handleToggle}
                toggling={toggling}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onRefresh={loadMembers}
            refreshing={loading}
          />

        </View>

      
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

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/dashboard/hearings')}>
            <Ionicons name="calendar-outline" size={22} color="#9CA3AF" />
            <Text style={styles.tab}>Hearings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/dashboard/settings')}>
            <Ionicons name="settings" size={22} color="#FBBF24" />
            <Text style={styles.activeTab}>Settings</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({

  safeArea: {
     flex: 1, 
     backgroundColor: '#071426' 
    },

  container: {
     flex: 1,
      backgroundColor: '#071426',
       paddingHorizontal: 16
       },

  centeredScreen: { 
    flex: 1,
     backgroundColor: '#071426',
      justifyContent: 'center', 
      alignItems: 'center',
       gap: 15 },


  loadingText: { 
    color: '#9CA3AF',
     fontSize: 14
     },


  errorText: {
   color: '#EF4444', 
   fontSize: 14, 
   textAlign: 'center', 
   paddingHorizontal: 30
   },

  retryBtn: { 
    backgroundColor: '#FBBF24', 
    paddingHorizontal: 20, 
    paddingVertical: 10,
     borderRadius: 8 },

  retryText: { color: '#000',
   fontWeight: 'bold'
   },
 
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', marginTop: 10,
     marginBottom: 16
     },

  backButton: { 
    marginRight: 10, 
    padding: 4 
  },

  screenTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },

  adminCard: { 
    flexDirection: 'row', 
    alignItems: 'center',
     backgroundColor: '#0F223A', 
     borderRadius: 12, 
     padding: 16, 
     marginBottom: 16
     },

  adminIcon: { 
    backgroundColor: '#1E3A5F',
     width: 48,
      height: 48, 
      borderRadius: 12, 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginRight: 14 },

  adminTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold'
   },

  
  adminSubtitle: { 
    color: '#9CA3AF',
     fontSize: 12,
      marginTop: 2 
    },
  
  statsRow: {
     flexDirection: 'row', 
     gap: 10, 
     marginBottom: 20
     },

  statCard: { 
    flex: 1,
     backgroundColor: '#0F223A',
      borderRadius: 12, 
      padding: 14,
       alignItems: 'center', 
       borderWidth: 1
       },

  statNumber: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold'
  },

  statLabel: { 
    color: '#9CA3AF', 
    fontSize: 11,
     marginTop: 4 },

  
  sectionTitle: { 
    color: '#fff',
     fontSize: 15, 
     fontWeight: '600', 
     marginBottom: 12 },


  memberCard: { 
    backgroundColor: '#0F223A', 
    borderRadius: 12, 
    borderWidth: 1,
     borderColor: 'white', 
     padding: 14,
      marginBottom: 19 
    },

  memberTop: {
     flexDirection: 'row', 
     alignItems: 'center', 
     marginBottom: 10 
    },

  avatar: {
     width: 42,
      height: 42,
      borderRadius: 21,
       alignItems: 'center', 
       justifyContent: 'center',
        marginRight: 12 },

  avatarText: {
     color: '#fff',
    fontSize: 14, 
    fontWeight: 'bold' 
  },


  memberInfo: { 
    flex: 1
   },

  memberName: {
     color: '#fff', 
     fontSize: 14, 
     fontWeight: '600'
     },

  memberEmail: { 
    color: '#9CA3AF', 
    fontSize: 11, 
    marginTop: 2 },

  memberSpecialty: {
     color: '#60A5FA',
      fontSize: 10, 
      marginTop: 2 },

  memberBottom: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
   },

  roleBadge: { backgroundColor: '#1F2937', 
  paddingHorizontal: 10,
   paddingVertical: 4,
   borderRadius: 8 },

  roleText: { color: '#9CA3AF',
   fontSize: 11 },

  statusPill: { paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8 },

  statusPillText: { fontSize: 11, 
    fontWeight: '600' },

 
  tabBar: { flexDirection: 'row', 
  justifyContent: 'space-between', 
  paddingHorizontal: 16, 
  paddingVertical: 10, 
  borderTopWidth: 1, 
  borderColor: '#1F2937', 
  backgroundColor: '#071426'
 },

  tabItem: { 
    alignItems: 'center' 
},
  activeTab: { 
    color: '#FBBF24', 
    fontSize: 11, 
    marginTop: 3 
  },

  tab: { color: '#9CA3AF', fontSize: 11, marginTop: 3 },
});