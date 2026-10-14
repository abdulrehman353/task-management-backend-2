import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../api/axiosClient';
import {
  checkHasUnreadNotifications,
  markNotificationsAsRead,
} from '../services/notificationService';

interface DashboardScreenProps {
  onLogout: () => void;
}

export default function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  const [userName, setUserName] = useState<string>('Ahmad');
  const [userEmail, setUserEmail] = useState<string>('ahmad@gmail.com');
  const [userRole, setUserRole] = useState<string>('MEMBER');

  const [projectCount, setProjectCount] = useState<number>(0);
  const [ticketCount, setTicketCount] = useState<number>(0);
  const [orgCount, setOrgCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Red badge state
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  // Check unread badge status on screen focus
  useFocusEffect(
    useCallback(() => {
      const syncBadge = async () => {
        const unread = await checkHasUnreadNotifications();
        setHasUnread(unread);
      };
      syncBadge();
    }, [])
  );

  const handleOpenNotifications = async () => {
    setHasUnread(false);
    await markNotificationsAsRead();
    router.push('/notifications');
  };

  const fetchDashboardData = async () => {
    try {
      // 1. User profile data
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) setUserName(u.name);
        if (u.email) setUserEmail(u.email);
        if (u.role) setUserRole(u.role);
      }

      // Check notification unread status
      const unread = await checkHasUnreadNotifications();
      setHasUnread(unread);

      // 2. Fetch live metrics from backend
      const [projectsRes, ticketsRes, orgsRes, usersRes] = await Promise.allSettled([
        api.get('/projects'),
        api.get('/tickets'),
        api.get('/orgs'),
        api.get('/users'),
      ]);

      if (projectsRes.status === 'fulfilled') {
        const pData = Array.isArray(projectsRes.value.data)
          ? projectsRes.value.data
          : projectsRes.value.data?.projects || [];
        setProjectCount(pData.length);
      }

      if (ticketsRes.status === 'fulfilled') {
        const tData = Array.isArray(ticketsRes.value.data)
          ? ticketsRes.value.data
          : ticketsRes.value.data?.tickets || [];
        setTicketCount(tData.length);
      }

      if (orgsRes.status === 'fulfilled') {
        const oData = Array.isArray(orgsRes.value.data)
          ? orgsRes.value.data
          : orgsRes.value.data?.organizations || [];
        setOrgCount(oData.length);
      }

      if (usersRes.status === 'fulfilled') {
        const uData = Array.isArray(usersRes.value.data)
          ? usersRes.value.data
          : usersRes.value.data?.users || [];
        setUserCount(uData.length);
      }
    } catch (e) {
      console.log('Dashboard fetch note:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'A';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10b981"
        />
      }
    >
      {/* Top Bar: Brand Logo, Notification Bell & Sign Out */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>TF</Text>
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandNameWhite}>Task</Text>
              <Text style={styles.brandNameGreen}>Flow</Text>
            </View>
            <View style={styles.statusLiveRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLiveText}>WORKSPACE LIVE</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Notification Bell Icon */}
          <TouchableOpacity
            style={[
              styles.bellBtn,
              { backgroundColor: colors.card, borderColor: colors.cardBorder }
            ]}
            onPress={handleOpenNotifications}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color="#cbd5e1" />
            {hasUnread && <View style={styles.redBadgeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info Card */}
      <View
        style={[
          styles.userCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userRole}</Text>
            </View>
          </View>
          <Text style={[styles.userEmail, { color: colors.subText }]}>{userEmail}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View
        style={[
          styles.metricsCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.metricItem}>
          <Text style={[styles.metricNumber, { color: '#34d399' }]}>
            {loading ? '-' : projectCount || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Projects</Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricNumber, { color: '#38bdf8' }]}>
            {loading ? '-' : ticketCount || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Tasks</Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricNumber, { color: '#818cf8' }]}>
            {loading ? '-' : orgCount || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Workspaces</Text>
        </View>

        <View style={[styles.metricDivider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricNumber, { color: '#fb7185' }]}>
            {loading ? '-' : userCount || 0}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.subText }]}>Users</Text>
        </View>
      </View>

      {/* Core Modules Heading */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionDot} />
        <Text style={styles.sectionTitle}>CORE MODULES</Text>
      </View>

      {/* Module 1: Task Board -> /tickets */}
      <TouchableOpacity
        style={[
          styles.moduleCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
        activeOpacity={0.75}
        onPress={() => router.push('/tickets')}
      >
        <View style={styles.moduleHeader}>
          <Text style={[styles.moduleTitle, { color: colors.text }]}>Task Board</Text>
          <View style={[styles.pillBadge, styles.activeBadge]}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        </View>
        <Text style={[styles.moduleSub, { color: colors.subText }]}>
          Kanban tickets & active tasks pipeline
        </Text>
      </TouchableOpacity>

      {/* Module 2: Projects -> /projects */}
      <TouchableOpacity
        style={[
          styles.moduleCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
        activeOpacity={0.75}
        onPress={() => router.push('/projects')}
      >
        <View style={styles.moduleHeader}>
          <Text style={[styles.moduleTitle, { color: colors.text }]}>Projects</Text>
          <View style={[styles.pillBadge, styles.workspaceBadge]}>
            <Text style={styles.workspaceBadgeText}>WORKSPACE</Text>
          </View>
        </View>
        <Text style={[styles.moduleSub, { color: colors.subText }]}>
          Active engineering repositories & sprints
        </Text>
      </TouchableOpacity>

      {/* Module 3: Organizations -> /organizations */}
      <TouchableOpacity
        style={[
          styles.moduleCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
        activeOpacity={0.75}
        onPress={() => router.push('/organizations')}
      >
        <View style={styles.moduleHeader}>
          <Text style={[styles.moduleTitle, { color: colors.text }]}>Organizations</Text>
          <View style={[styles.pillBadge, styles.portalBadge]}>
            <Text style={styles.portalBadgeText}>PORTAL</Text>
          </View>
        </View>
        <Text style={[styles.moduleSub, { color: colors.subText }]}>
          Multi-tenant enterprise structure
        </Text>
      </TouchableOpacity>

      {/* Module 4: Attachments -> /attachments */}
      <TouchableOpacity
        style={[
          styles.moduleCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
        activeOpacity={0.75}
        onPress={() => router.push('/attachments')}
      >
        <View style={styles.moduleHeader}>
          <Text style={[styles.moduleTitle, { color: colors.text }]}>Attachments</Text>
          <View style={[styles.pillBadge, styles.storageBadge]}>
            <Text style={styles.storageBadgeText}>STORAGE</Text>
          </View>
        </View>
        <Text style={[styles.moduleSub, { color: colors.subText }]}>
          Cloud MinIO documents & assets
        </Text>
      </TouchableOpacity>

      {/* Module 5: System Users -> /users */}
      <TouchableOpacity
        style={[
          styles.moduleCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
        activeOpacity={0.75}
        onPress={() => router.push('/users')}
      >
        <View style={styles.moduleHeader}>
          <Text style={[styles.moduleTitle, { color: colors.text }]}>System Users</Text>
          <View style={[styles.pillBadge, styles.usersBadge]}>
            <Text style={styles.usersBadgeText}>MEMBERS</Text>
          </View>
        </View>
        <Text style={[styles.moduleSub, { color: colors.subText }]}>
          Corporate accounts, assigned tasks & role allocations
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  redBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#022c22',
    fontSize: 18,
    fontWeight: '900',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandNameWhite: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandNameGreen: {
    color: '#34d399',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusLiveText: {
    color: '#10b981',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  signOutBtnText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#022c22',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  roleBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
    paddingVertical: 1,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  roleText: {
    color: '#34d399',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  userEmail: {
    fontSize: 12.5,
  },
  metricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: -4,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  moduleCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 6,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  moduleSub: {
    fontSize: 12.5,
  },
  pillBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.28)',
  },
  activeBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  workspaceBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.28)',
  },
  workspaceBadgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },
  portalBadge: {
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    borderColor: 'rgba(129, 140, 248, 0.28)',
  },
  portalBadgeText: {
    color: '#a5b4fc',
    fontSize: 10,
    fontWeight: '800',
  },
  storageBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.28)',
  },
  storageBadgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
  },
  usersBadge: {
    backgroundColor: 'rgba(251, 113, 133, 0.12)',
    borderColor: 'rgba(251, 113, 133, 0.28)',
  },
  usersBadgeText: {
    color: '#fb7185',
    fontSize: 10,
    fontWeight: '800',
  },
});