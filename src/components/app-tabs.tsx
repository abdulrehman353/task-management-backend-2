import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AppTabs() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Home',
      route: '/',
      icon: 'home-outline',
      activeIcon: 'home',
    },
    {
      name: 'Profile',
      route: '/profile',
      icon: 'person-outline',
      activeIcon: 'person',
    },
    {
      name: 'Settings',
      route: '/settings',
      icon: 'settings-outline',
      activeIcon: 'settings',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.route === '/'
            ? pathname === '/' || pathname === '/index'
            : pathname === tab.route;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              if (!isActive) {
                router.push(tab.route as any);
              }
            }}
          >
            <Ionicons
              name={(isActive ? tab.activeIcon : tab.icon) as any}
              size={22}
              color={isActive ? colors.primary : colors.subText}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? colors.primary : colors.subText,
                  fontWeight: isActive ? '800' : '600',
                },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
  },
});