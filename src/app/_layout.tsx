import { AlertProvider } from '@/context/AlertContext';
import { NotificationProvider, useAppNotification } from '@/context/NotificationContext';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  requestNotificationPermission,
  setGlobalNotificationHandler,
} from '../services/notificationService';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

SplashScreen.preventAutoHideAsync().catch(() => {});

function NotificationConnector() {
  const { showNotification } = useAppNotification();

  useEffect(() => {
    setGlobalNotificationHandler(showNotification);
  }, [showNotification]);

  return null;
}

function RootContent() {
  const { colors } = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    requestNotificationPermission();

    let subscription: any = null;
    if (!isExpoGo) {
      try {
        const Notifications = require('expo-notifications');
        subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
          const data = response?.notification?.request?.content?.data;
          if (data && data.screen && data.screen !== '/notifications') {
            if (data.ticketId) {
              router.push({
                pathname: '/tickets',
                params: { ticketId: String(data.ticketId) },
              });
            } else {
              router.push(data.screen);
            }
          } else {
            router.push('/notifications');
          }
        });
      } catch (err) {
        console.log('Layout notification listener skipped:', err);
      }
    }

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <NotificationConnector />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="tickets" />
        <Stack.Screen name="projects" />
        <Stack.Screen name="organizations" />
        <Stack.Screen name="attachments" />
        <Stack.Screen name="users" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
      </Stack>
    </View>
  );
}



export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <AlertProvider>
          <RootContent />
        </AlertProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b12',
  },
});