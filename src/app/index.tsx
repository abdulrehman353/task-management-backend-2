import AppTabs from '@/components/app-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import SignupScreen from '../screens/SignupScreen';

type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');

  // Reset password params
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const checkAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      setToken(savedToken);
    } catch (err) {
      console.error('Failed to load token', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setAuthView('login');
  };

  const navigateToReset = (email: string, token?: string) => {
    setResetEmail(email);
    if (token) setResetToken(token);
    setAuthView('reset');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#070b12" />

      {token ? (
        <View style={styles.dashboardWrapper}>
          <View style={styles.dashboardContent}>
            <DashboardScreen onLogout={handleLogout} />
          </View>
          <AppTabs />
        </View>
      ) : authView === 'signup' ? (
        <SignupScreen
          onSignupSuccess={checkAuth}
          onNavigateToLogin={() => setAuthView('login')}
        />
      ) : authView === 'forgot' ? (
        <ForgotPasswordScreen
          onNavigateToLogin={() => setAuthView('login')}
          onNavigateToReset={navigateToReset}
        />
      ) : authView === 'reset' ? (
        <ResetPasswordScreen
          initialEmail={resetEmail}
          initialToken={resetToken}
          onNavigateToLogin={() => setAuthView('login')}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={checkAuth}
          onNavigateToSignup={() => setAuthView('signup')}
          onNavigateToForgotPassword={() => setAuthView('forgot')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#070b12',
  },
  dashboardWrapper: {
    flex: 1,
  },
  dashboardContent: {
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: '#070b12',
    justifyContent: 'center',
    alignItems: 'center',
  },
});