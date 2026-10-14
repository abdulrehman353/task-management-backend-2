import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useContext, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });

  const showAlert = (options: AlertOptions) => {
    setConfig({
      type: 'info',
      buttons: [{ text: 'OK' }],
      ...options,
    });
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const getIconAndColor = () => {
    switch (config.type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#34d399' };
      case 'error':
        return { name: 'alert-circle' as const, color: '#f87171' };
      case 'warning':
        return { name: 'warning' as const, color: '#fbbf24' };
      default:
        return { name: 'information-circle' as const, color: '#38bdf8' };
    }
  };

  const iconInfo = getIconAndColor();

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={[styles.iconCircle, { borderColor: `${iconInfo.color}33` }]}>
              <Ionicons name={iconInfo.name} size={28} color={iconInfo.color} />
            </View>

            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.message}>{config.message}</Text>

            <View style={styles.actionsRow}>
              {config.buttons && config.buttons.length > 0 ? (
                config.buttons.map((btn, idx) => {
                  const isCancel = btn.style === 'cancel';
                  const isDestructive = btn.style === 'destructive';

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.button,
                        isCancel && styles.cancelButton,
                        isDestructive && styles.destructiveButton,
                        !isCancel && !isDestructive && styles.primaryButton,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => {
                        hideAlert();
                        if (btn.onPress) btn.onPress();
                      }}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          isCancel && styles.cancelButtonText,
                          isDestructive && styles.destructiveButtonText,
                          !isCancel && !isDestructive && styles.primaryButtonText,
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={hideAlert}
                >
                  <Text style={[styles.buttonText, styles.primaryButtonText]}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAppAlert must be used within AlertProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0b1120',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 22,
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  message: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  destructiveButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#022c22',
    fontWeight: '800',
  },
  cancelButtonText: {
    color: '#94a3b8',
  },
  destructiveButtonText: {
    color: '#f87171',
    fontWeight: '800',
  },
});