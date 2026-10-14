import { useAppAlert } from '@/context/AlertContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axiosClient from '../api/axiosClient';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
}

export default function LoginScreen({
  onLoginSuccess,
  onNavigateToSignup,
  onNavigateToForgotPassword,
}: LoginScreenProps) {
  const { showAlert } = useAppAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert({
        title: 'Required Fields',
        message: 'Please enter your email and password.',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: email.trim(),
        Email: email.trim(),
        password: password,
        Password: password,
      };

      const response = await axiosClient.post('/auth/login', payload);
      const data = response?.data;

      const token = data?.token || data?.access_token || data?.data?.token;
      const user = data?.user || data?.data?.user;

      if (token) {
        await AsyncStorage.setItem('token', token);
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
        onLoginSuccess();
      } else if (data) {
        onLoginSuccess();
      } else {
        showAlert({
          title: 'Login Failed',
          message: 'Authentication succeeded but no token received.',
          type: 'error',
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Server error during login.';

      showAlert({
        title: 'Login Failed',
        message: serverMsg,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Brand Header */}
          <View style={styles.headerArea}>
            <View style={styles.badgeRow}>
              <View style={styles.statusDot} />
              <Text style={styles.systemStatusText}>SYSTEM OPERATIONAL</Text>
            </View>

            <Text style={styles.brandTitle}>
              Task<Text style={styles.brandHighlight}>Flow</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Enterprise Workspace Environment</Text>
          </View>

          {/* Email Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Corporate Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={17} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@gmail.com"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.formGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={onNavigateToForgotPassword}>
                <Text style={styles.forgotLink}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={17} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Enter Workspace Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <View style={styles.loginBtnContent}>
                <Text style={styles.loginBtnText}>Enter Workspace</Text>
                <Ionicons name="arrow-forward" size={16} color="#022c22" />
              </View>
            )}
          </TouchableOpacity>

          {/* Security Assurance Badge */}
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark-outline" size={13} color="#10b981" />
            <Text style={styles.securityText}>256-bit Encrypted SSL Session</Text>
          </View>

          {/* Footer - Switch to Signup */}
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>Don't have enterprise access? </Text>
            <TouchableOpacity onPress={onNavigateToSignup}>
              <Text style={styles.signUpLink}>Register Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#070b12',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 14,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  systemStatusText: {
    color: '#10b981',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: '#10b981',
  },
  brandSubtitle: {
    fontSize: 12.5,
    color: '#94a3b8',
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotLink: {
    color: '#34d399',
    fontSize: 11.5,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#030712',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13.5,
    paddingVertical: 12,
  },
  eyeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  loginBtn: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loginBtnText: {
    color: '#022c22',
    fontSize: 14.5,
    fontWeight: '800',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingVertical: 4,
  },
  securityText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 14,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12.5,
  },
  signUpLink: {
    color: '#34d399',
    fontSize: 12.5,
    fontWeight: '700',
  },
});