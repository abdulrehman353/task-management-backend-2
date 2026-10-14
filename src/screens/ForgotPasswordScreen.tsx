import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToReset: (email: string, token?: string) => void;
}

export default function ForgotPasswordScreen({
  onNavigateToLogin,
  onNavigateToReset,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      Alert.alert('Required Field', 'Please enter your registered corporate email.');
      return;
    }

    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/forgot-password', {
        email: targetEmail,
        Email: targetEmail,
      });

      const data = response?.data;
      const resetToken =
        data?.token ||
        data?.resetToken ||
        data?.data?.token ||
        data?.data?.resetToken;

      Alert.alert(
        'Request Sent',
        'Password recovery instructions verified. Proceeding to reset password.',
        [
          {
            text: 'Continue',
            onPress: () => onNavigateToReset(targetEmail, resetToken),
          },
        ]
      );
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to process recovery request. Please try again.';

      Alert.alert('Recovery Failed', serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Top Back Action */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onNavigateToLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Back to Login</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerArea}>
            <View style={styles.badgeRow}>
              <View style={styles.statusDot} />
              <Text style={styles.systemStatusText}>ACCOUNT RECOVERY</Text>
            </View>
            <Text style={styles.brandTitle}>
              Forgot <Text style={styles.brandHighlight}>Password</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              Enter your registered corporate email address to receive password recovery details.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Corporate Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="developer@company.com"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#022c22" />
            ) : (
              <Text style={styles.submitBtnText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <TouchableOpacity onPress={onNavigateToLogin}>
              <Text style={styles.signInLink}>Return to Login</Text>
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
    backgroundColor: '#0a0f1d',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 32,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 10,
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
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: '#10b981',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0b1120',
    color: '#ffffff',
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#022c22',
    fontSize: 15,
    fontWeight: '700',
  },
  cardFooter: {
    marginTop: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 16,
  },
  signInLink: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '700',
  },
});