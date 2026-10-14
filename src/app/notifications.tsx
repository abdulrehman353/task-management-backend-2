import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    getStoredNotifications,
    markNotificationsAsRead,
} from '../services/notificationService';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    await markNotificationsAsRead();
    const list = await getStoredNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all notification alerts?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.setItem('@app_notifications_history', JSON.stringify([]));
            setNotifications([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header matching Task Board Theme */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#34d399" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <View style={styles.badgePill}>
            <View style={styles.statusDot} />
            <Text style={styles.badgeText}>SYSTEM AUDIT & LOGS</Text>
          </View>
          <Text style={styles.heading} numberOfLines={1}>
            Notifications
          </Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-bin-outline" size={15} color="#f87171" />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Counter bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusBarItem}>
          <Text style={styles.statusCount}>{notifications.length}</Text>
          <Text style={styles.statusLabel}>Total Activity Alerts</Text>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={42} color="#475569" />
            </View>
            <Text style={styles.emptyTitle}>No Notifications Yet</Text>
            <Text style={styles.emptySubText}>
              All system events, task updates, and workspace alerts will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((item, idx) => {
            const hasTargetScreen = !!item.data?.screen;

            return (
              <TouchableOpacity
                key={item.id || idx}
                style={styles.notifCard}
                activeOpacity={hasTargetScreen ? 0.75 : 1}
                onPress={() => {
                  if (item.data?.screen) {
                    if (item.data.ticketId) {
                      router.push({
                        pathname: '/tickets',
                        params: { ticketId: String(item.data.ticketId) },
                      });
                    } else {
                      router.push(item.data.screen);
                    }
                  }
                }}
              >
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <View style={styles.cardDot} />
                    <Text style={styles.notifTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                  <Text style={styles.timeText}>{item.timestamp || 'Just now'}</Text>
                </View>

                {/* Body Text */}
                <Text style={styles.notifBody}>{item.body}</Text>

                {/* Footer contextual pill */}
                {hasTargetScreen && (
                  <View style={styles.cardFooter}>
                    <View style={styles.actionPill}>
                      <Ionicons name="open-outline" size={12} color="#34d399" />
                      <Text style={styles.actionPillText}>Tap to inspect</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  badgeText: {
    color: '#34d399',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#f87171',
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0b1120',
  },
  statusBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#34d399',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  scrollArea: {
    padding: 18,
    paddingBottom: 40,
    gap: 12,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0b1120',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubText: {
    color: '#64748b',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  notifCard: {
    backgroundColor: '#0b1120',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  cardDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  notifTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  timeText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  notifBody: {
    color: '#94a3b8',
    fontSize: 12.5,
    lineHeight: 18,
    paddingLeft: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    paddingLeft: 15,
    paddingTop: 4,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionPillText: {
    color: '#34d399',
    fontSize: 10.5,
    fontWeight: '700',
  },
});