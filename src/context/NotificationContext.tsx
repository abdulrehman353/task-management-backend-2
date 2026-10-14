import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationData {
  title: string;
  body: string;
}

interface NotificationContextType {
  showNotification: (title: string, body: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<NotificationData | null>(null);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const timeoutRef = useRef<any>(null);

  const showNotification = async (title: string, body: string) => {
    // Settings check
    const pref = await AsyncStorage.getItem('notificationsEnabled');
    if (pref === 'false') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setData({ title, body });

    // Haptic vibration feel
    try {
      Vibration.vibrate([0, 70]);
    } catch {}

    // Slide Down
    Animated.spring(slideAnim, {
      toValue: insets.top + 8,
      useNativeDriver: true,
      damping: 14,
      stiffness: 120,
    }).start();

    // Auto Slide Up after 3.8 seconds
    timeoutRef.current = setTimeout(() => {
      hideNotification();
    }, 3800);
  };

  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setData(null);
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {/* Top Sliding Heads-Up Banner */}
      {data && (
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideNotification}
            style={styles.bannerCard}
          >
            <View style={styles.iconBox}>
              <Ionicons name="notifications" size={18} color="#10b981" />
            </View>

            <View style={styles.textWrap}>
              <View style={styles.topRow}>
                <Text style={styles.appName}>TASKFLOW</Text>
                <Text style={styles.timeText}>now</Text>
              </View>
              <Text style={styles.titleText} numberOfLines={1}>
                {data.title}
              </Text>
              <Text style={styles.bodyText} numberOfLines={2}>
                {data.body}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

export const useAppNotification = () => useContext(NotificationContext);

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    zIndex: 999999,
  },
  bannerCard: {
    backgroundColor: '#0b1120',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 0.6,
  },
  timeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  bodyText: {
    fontSize: 11.5,
    color: '#94a3b8',
    lineHeight: 16,
  },
});