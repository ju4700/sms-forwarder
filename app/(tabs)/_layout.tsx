import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity, Send, FileText, Settings, Menu } from 'lucide-react-native';
import { useDrawer } from '../_layout';

interface CustomHeaderProps {
  title: string;
}

function CustomHeader({ title }: CustomHeaderProps) {
  const { openDrawer } = useDrawer();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
        <Menu size={24} color="#111827" />
      </TouchableOpacity>
      <View style={styles.headerSpacer} />
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        header: ({ options }) => (
          <CustomHeader title={options.title || 'SMS Forwarder'} />
        ),
        tabBarActiveTintColor: '#0057FF',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 66,
          paddingBottom: 12,
          paddingTop: 6,
          paddingHorizontal: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
          marginTop: -2,
        },
        tabBarIconStyle: {
          marginTop: -6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Monitor',
          tabBarIcon: ({ size, color }) => (
            <Activity size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="forwarded"
        options={{
          title: 'Forwarded',
          tabBarIcon: ({ size, color }) => <Send size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'SMS Logs',
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerSpacer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
});
