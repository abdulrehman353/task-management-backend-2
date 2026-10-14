import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Conditional require to prevent Expo Go SDK 53 crash
let Notifications: any = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.log('Notifications require error:', err);
  }
}

const NOTIFICATIONS_STORAGE_KEY = '@app_notifications_history';
const UNREAD_STATUS_KEY = '@app_notifications_has_unread';

export async function setupNotificationChannel() {
  if (!isExpoGo && Notifications && Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'TaskFlow Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
        sound: 'default',
      });
    } catch (e) {
      console.log('Channel error:', e);
    }
  }
}

export async function requestNotificationPermission() {
  if (isExpoGo || !Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    await setupNotificationChannel();
    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

export async function triggerLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {}
) {
  try {
    if (!isExpoGo && Notifications) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data, sound: 'default', color: '#10b981' },
        trigger: null,
      });
    }

    const existing = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list = existing ? JSON.parse(existing) : [];
    const newEntry = {
      id: Date.now().toString(),
      title,
      body,
      data,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    list.unshift(newEntry);
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
    await AsyncStorage.setItem(UNREAD_STATUS_KEY, 'true');
  } catch (err) {
    console.log('Notification log:', err);
  }
}

export async function getStoredNotifications() {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function checkHasUnreadNotifications(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(UNREAD_STATUS_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function markNotificationsAsRead() {
  try {
    await AsyncStorage.setItem(UNREAD_STATUS_KEY, 'false');
  } catch (e) {
    console.log(e);
  }
}

export function setGlobalNotificationHandler(handler?: any) {}