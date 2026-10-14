import AppTabs from '@/components/app-tabs';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axiosClient';

interface UserData {
  id?: number;
  UserID?: number;
  user_id?: number;
  name?: string;
  Name?: string;
  email?: string;
  role?: string;
  organizationId?: number;
  OrganizationID?: number;
  org_id?: number;
  OrgID?: number;
  createdAt?: string;
}

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Metrics States
  const [assignedProjectsCount, setAssignedProjectsCount] = useState<number>(0);
  const [assignedTicketsCount, setAssignedTicketsCount] = useState<number>(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      let activeUser: UserData | null = null;
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        activeUser = JSON.parse(storedUser);
        setUser(activeUser);
      }

      // Fresh user profile fetch
      const res = await api.get('/users/me').catch(() => null);
      if (res?.data) {
        activeUser = res.data;
        setUser(activeUser);
        await AsyncStorage.setItem('user', JSON.stringify(res.data));
      }

      const currentUserId = activeUser?.id ?? activeUser?.UserID ?? activeUser?.user_id;
      const currentOrgId = activeUser?.organizationId ?? activeUser?.OrganizationID ?? activeUser?.org_id ?? activeUser?.OrgID;

      // Dynamic Metrics Fetch: Tickets & Projects
      const [ticketsRes, projectsRes] = await Promise.allSettled([
        api.get('/tickets'),
        api.get('/projects'),
      ]);

      // Calculate Assigned Active Tickets
      if (ticketsRes.status === 'fulfilled') {
        const rawTickets = Array.isArray(ticketsRes.value.data)
          ? ticketsRes.value.data
          : ticketsRes.value.data?.tickets || [];

        const myActiveTickets = rawTickets.filter((t: any) => {
          const assignedId =
            t.AssignedToUserID ??
            t.assignedToUserId ??
            t.AssignedTo ??
            t.assigned_to ??
            t.assignedTo ??
            t.UserID ??
            t.userId;

          const status = (t.status || t.Status || '').toLowerCase();
          const isAssigned = currentUserId ? Number(assignedId) === Number(currentUserId) : false;
          const isActive = status !== 'done';
          return isAssigned && isActive;
        });

        setAssignedTicketsCount(myActiveTickets.length);
      }

      // Calculate Assigned / Org Projects
      if (projectsRes.status === 'fulfilled') {
        const rawProjects = Array.isArray(projectsRes.value.data)
          ? projectsRes.value.data
          : projectsRes.value.data?.projects || [];

        const myProjects = rawProjects.filter((p: any) => {
          const projOrg = p.OrgID ?? p.org_id ?? p.OrganizationID ?? p.organization_id;
          if (currentOrgId) {
            return Number(projOrg) === Number(currentOrgId);
          }
          return true;
        });

        setAssignedProjectsCount(myProjects.length);
      }
    } catch (e) {
      console.log('Error loading profile metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from TaskFlow?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'user']);
          router.replace('/');
        },
      },
    ]);
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  const orgDisplayId = user?.organizationId ?? user?.OrganizationID ?? user?.org_id ?? user?.OrgID ?? 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>User Profile</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleSignOut} style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={16} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Identity Card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.avatarSection}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.nameSection}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {user?.name || user?.Name || 'Ahmad'}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.subText }]}>
                    {user?.email || 'ahmad@gmail.com'}
                  </Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role || 'MEMBER'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Enterprise Details Card */}
            <Text style={[styles.sectionTitle, { color: colors.subText }]}>ENTERPRISE WORKSPACE</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="business-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.infoMeta}>
                  <Text style={[styles.infoLabel, { color: colors.subText }]}>Organization</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>Tech Corp (#{orgDisplayId})</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#38bdf8" />
                </View>
                <View style={styles.infoMeta}>
                  <Text style={[styles.infoLabel, { color: colors.subText }]}>Access Level</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>Full Member Privileges</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="key-outline" size={18} color="#fbbf24" />
                </View>
                <View style={styles.infoMeta}>
                  <Text style={[styles.infoLabel, { color: colors.subText }]}>Session Security</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>JWT Token Encrypted</Text>
                </View>
              </View>
            </View>

            {/* Dynamic Quick Stats */}
            <Text style={[styles.sectionTitle, { color: colors.subText }]}>WORKSPACE ACTIVITY</Text>
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{assignedProjectsCount}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Assigned Projects</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.statNum, { color: '#38bdf8' }]}>{assignedTicketsCount}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Active Tickets</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* 3-Tab Bottom Navigation */}
      <AppTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#022c22',
  },
  nameSection: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginTop: 2,
  },
  roleText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoMeta: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});