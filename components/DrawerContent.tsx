import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  FileText,
  HelpCircle,
  Lock,
  X,
  ExternalLink,
} from 'lucide-react-native';

interface DrawerContentProps {
  onClose: () => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  route: string;
  description: string;
}

export default function DrawerContent({ onClose }: DrawerContentProps) {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      icon: <Lock size={22} color="#0057FF" />,
      label: 'Privacy Policy',
      route: '/privacy-policy',
      description: 'How we handle your data',
    },
    {
      icon: <FileText size={22} color="#0057FF" />,
      label: 'Terms & Conditions',
      route: '/terms',
      description: 'Usage terms and conditions',
    },
    {
      icon: <HelpCircle size={22} color="#0057FF" />,
      label: 'How It Works',
      route: '/how-it-works',
      description: '100% local processing explained',
    },
    {
      icon: <Shield size={22} color="#0057FF" />,
      label: 'Security Info',
      route: '/security-info',
      description: 'Play Protect & permissions FAQ',
    },
  ];

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Shield size={32} color="#0057FF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.appName}>SMS Forwarder</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleNavigation(item.route)}
          >
            <View style={styles.menuIcon}>{item.icon}</View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <ExternalLink size={16} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.securityBadge}>
          <Shield size={16} color="#059669" />
          <Text style={styles.securityText}>100% Local Processing</Text>
        </View>
        <Text style={styles.footerText}>
          Your data never leaves your device unless you configure forwarding.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0057FF',
  },
  headerText: {
    marginLeft: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  appVersion: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f0fdf4',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
});
