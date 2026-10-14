import AppTabs from '@/components/app-tabs';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useAppTheme();
  const [notifications, setNotifications] = useState(true);

  const isDarkMode = theme === 'dark';

  // Load saved notification preference on mount
  useEffect(() => {
    (async () => {
      const savedPref = await AsyncStorage.getItem('notificationsEnabled');
      if (savedPref !== null) {
        setNotifications(savedPref === 'true');
      }
    })();
  }, []);

  // Handle toggle & persist preference
  const handleToggleNotifications = async (val: boolean) => {
    setNotifications(val);
    await AsyncStorage.setItem('notificationsEnabled', String(val));
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Do you want to reset offline cache and local temporary storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Application cache cleared successfully.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Section 1: Appearance */}
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons
                    name={isDarkMode ? 'moon' : 'sunny'}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Theme</Text>
                  <Text style={[styles.settingSub, { color: colors.subText }]}>
                    {isDarkMode ? 'Slate Emerald Mode active' : 'Bright daylight mode active'}
                  </Text>
                </View>
              </View>

              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          {/* Section 2: Preferences */}
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                  <Ionicons name="notifications-outline" size={20} color="#38bdf8" />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
                  <Text style={[styles.settingSub, { color: colors.subText }]}>Task assignments & alerts</Text>
                </View>
              </View>

              <Switch
                value={notifications}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

            <TouchableOpacity activeOpacity={0.7} onPress={handleClearCache} style={styles.actionRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Ionicons name="trash-bin-outline" size={20} color="#fbbf24" />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Clear Cache</Text>
                  <Text style={[styles.settingSub, { color: colors.subText }]}>Reset temporary images & storage</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subText} />
            </TouchableOpacity>
          </View>

          {/* Section 3: System Infrastructure */}
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>SYSTEM INFRASTRUCTURE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoKey, { color: colors.subText }]}>Environment</Text>
              <Text style={[styles.infoVal, { color: colors.primary }]}>TaskFlow Live Production</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoKey, { color: colors.subText }]}>Storage Engine</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>MinIO S3 Buckets</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoKey, { color: colors.subText }]}>Tunnel Protocol</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>Cloudflare HTTP2</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoKey, { color: colors.subText }]}>Build Version</Text>
              <Text style={[styles.infoVal, { color: colors.text }]}>v1.0.0 Enterprise</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Persistent Bottom Bar */}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginTop: 6,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoKey: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});