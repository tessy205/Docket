import {
  View,  Text,  StyleSheet,  ScrollView,  TouchableOpacity,  ActivityIndicator,  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
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
  if (!role) return '';
  return role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};


const rolePermissions = {
  senior_partner: [
    'View All Cases',
    'Edit Any Case',
    'Create Cases',
    'Delete Cases',
    'Manage Users',
    'View Reports',
    'Manage Clients',
  ],
  secretary: [
    'View All Cases',
    'Create Cases',
    'Edit Any Case',
    'Manage Clients',
    'Schedule Hearings',
  ],
  associate: [
    'View Own Cases',
    'Schedule Hearings',
    'Update Case Status',
  ],
};


function SettingsRow({ iconName, iconBg, title, subtitle, badge, onPress }) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
      <View style={[styles.rowIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color="#fff" />
      </View>
      <View style={styles.rowMiddle}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.rowBadge}>
          <Text style={styles.rowBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}


function SectionLabel({ label }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

export default function Settings() {
  const router = useRouter();

 
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

 
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/auth/me`, { headers });
        const data = await response.json();

        if (data.success) {
          setUser(data.data);
         
          await AsyncStorage.setItem('user', JSON.stringify(data.data));
        } else {
          
          if (response.status === 401) handleForceLogout();
        }
      } catch (err) {
   
        const stored = await AsyncStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleForceLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/auth/index2');
  };


  const handleSignOut = () => {

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              const headers = await getAuthHeaders();
              
              await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers,
              });
            } catch (err) {
           
            } finally {
            
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              setLoggingOut(false);
      
              router.replace('/auth/index2');
            }
          },
        },
      ]
    );
  };

  const permissions = user
    ? (rolePermissions[user.role] || [])
    : [];

 
  const isSeniorPartner = user?.role === 'senior_partner';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          <Text style={styles.screenTitle}>Settings</Text>

          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {getInitials(user?.full_name)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user?.full_name || 'Lawyer'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{formatRole(user?.role)}</Text>
              </View>
              <Text style={styles.firmName}>{user?.email || ''}</Text>
              {user?.specialty && (
                <Text style={styles.specialty}>{user.specialty}</Text>
              )}
            </View>
          </View>

          <SectionLabel label="YOUR PERMISSIONS" />
          <View style={styles.permissionsBox}>
            <View style={styles.permissionsWrap}>
              {permissions.map((perm) => (
                <View key={perm} style={styles.permTag}>
                  <Text style={styles.permText}>{perm}</Text>
                </View>
              ))}
            </View>
          </View>

       
          {isSeniorPartner && (
            <>
              <SectionLabel label="ADMIN" />
              <View style={styles.section}>
                <SettingsRow
                  iconName="shield-checkmark-outline"
                  iconBg="#1E3A5F"
                  title="Admin Portal"
                  subtitle="Manage team access & permissions"
                  badge="Team"
                  onPress={() => router.push('/dashboard/adminportal')}
                />
              </View>
            </>
          )}

      
          <SectionLabel label="ACCOUNT" />
          <View style={styles.section}>
            <SettingsRow
              iconName="person-outline"
              iconBg="#1F2937"
              title="Edit Profile"
              subtitle={user?.email || 'Name, phone, email'}
            />
            <View style={styles.divider} />
            <SettingsRow
              iconName="lock-closed-outline"
              iconBg="#1F2937"
              title="Change Password"
              subtitle="Update credentials"
            />
          </View>

       
          <SectionLabel label="FIRM" />
          <View style={styles.section}>
            <SettingsRow
              iconName="briefcase-outline"
              iconBg="#1F2937"
              title="Firm Settings"
              subtitle="Mex-Trial & Associates"
            />
            <View style={styles.divider} />
            <SettingsRow
              iconName="bar-chart-outline"
              iconBg="#1F2937"
              title="Reports"
              subtitle="Analytics & exports"
            />
          </View>

      
          <SectionLabel label="NOTIFICATIONS" />
          <View style={styles.section}>
            <SettingsRow
              iconName="notifications-outline"
              iconBg="#1F2937"
              title="Hearing Alerts"
              subtitle="3-day and 7-day reminders"
            />
            <View style={styles.divider} />
            <SettingsRow
              iconName="calendar-outline"
              iconBg="#1F2937"
              title="Daily Digest"
              subtitle="Morning case summary"
            />
          </View>

   
          <TouchableOpacity
            style={styles.signOutRow}
            onPress={handleSignOut}
            disabled={loggingOut}
          >
            <View style={[styles.rowIconBox, { backgroundColor: '#3B0A0A' }]}>
              {loggingOut ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
              )}
            </View>
            <Text style={styles.signOutText}>
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />

        </ScrollView>

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

          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="settings" size={22} color="#FBBF24" />
            <Text style={styles.activeTab}>Settings</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#071426' },

  container: { flex: 1, backgroundColor: '#071426', paddingHorizontal: 16 },

  centeredScreen: { flex: 1, 
    backgroundColor: '#071426', 
    
    justifyContent: 'center', alignItems: 'center', gap: 15 },

  loadingText: { color: '#9CA3AF', 
  fontSize: 14 },


  screenTitle: { 
    color: '#fff', 
  fontSize: 22, 
  fontWeight: 'bold', 
  marginTop: 10, 
  marginBottom: 16 },

  profileCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F223A', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20 },

  profileAvatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#1E3A5F', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14 },

  profileAvatarText: { color: '#fff', 
  fontSize: 18, 
  fontWeight: 'bold' },

  profileName: {
     color: '#fff', 
  fontSize: 16, 
  fontWeight: 'bold', 
  marginBottom: 4 },

  roleBadge: { 
    backgroundColor: '#FBBF24', 
  alignSelf: 'flex-start', 
  paddingHorizontal: 8,
   paddingVertical: 2, 
   borderRadius: 6, 
   marginBottom: 4 },

  roleText: { color: '#000', 
  fontSize: 10, 
  fontWeight: '700' },

  firmName: { color: '#9CA3AF',
   fontSize: 12 },

  specialty: { 
    color: '#60A5FA', 
  fontSize: 11, 
  marginTop: 2 },


  sectionLabel: { 
    color: '#9CA3AF', 
  fontSize: 11, 
  fontWeight: '600', 
  marginBottom: 8, 
  letterSpacing: 1 },

  permissionsBox: { 
  backgroundColor: '#0F223A',
   borderRadius: 12,
    padding: 14, 
   marginBottom: 20 },

  permissionsWrap: { flexDirection: 'row', 
  flexWrap: 'wrap',
   gap: 8 },

  permTag: { backgroundColor: '#052E16', 
  paddingHorizontal: 10,
   paddingVertical: 5, 
  borderRadius: 20,
   borderWidth: 1, 
  borderColor: '#22C55E' },

  permText: { color: '#22C55E', 
  fontSize: 11 },

  section: { backgroundColor: '#0F223A',
   borderRadius: 12, 
   marginBottom: 20, 
   overflow: 'hidden' },

  settingsRow: { flexDirection: 'row', 
  alignItems: 'center',
   padding: 14 },

  rowIconBox: { width: 36, 
    height: 36, 
    borderRadius: 10, 
    alignItems: 'center', 
  justifyContent: 'center', 
  marginRight: 12 },

  rowMiddle: { flex: 1 },

  rowTitle: { color: '#fff',
   fontSize: 14, 
   fontWeight: '500' },

  rowSubtitle: { color: '#9CA3AF', 
  fontSize: 11, 
  marginTop: 2 },

  rowBadge: { backgroundColor: '#FBBF24',
   paddingHorizontal: 8, 
  paddingVertical: 3, 
  borderRadius: 10, 
  marginRight: 8 },

  rowBadgeText: { color: '#000', 
  fontSize: 10, 
  fontWeight: '700' },

  divider: { height: 1, 
    backgroundColor: '#1F2937',
     marginLeft: 62 },
 
  signOutRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F223A', 
  borderRadius: 12, 
  padding: 14, 
  marginBottom: 10 },

  signOutText: { 
    color: '#EF4444', 
  fontSize: 14, 
  fontWeight: '600', 
  marginLeft: 12 },

  tabBar: { flexDirection: 'row', 
  justifyContent: 'space-between', 
  paddingHorizontal: 16, 
  paddingVertical: 10, 
  borderTopWidth: 1, 
  borderColor: '#1F2937',
   backgroundColor: '#071426' },

  tabItem: { alignItems: 'center' },

  activeTab: { 
    color: '#FBBF24', 
  fontSize: 11, 
  marginTop: 3 },

  tab: { 
    color: '#9CA3AF', 
  fontSize: 11, 
  marginTop: 3 },
});