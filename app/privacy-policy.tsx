import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Lock, Database, Wifi } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Lock size={40} color="#0057FF" />
          </View>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroSubtitle}>
            SMS Forwarder is designed with privacy as a core principle
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={20} color="#0057FF" />
            <Text style={styles.sectionTitle}>Data Collection</Text>
          </View>
          <Text style={styles.sectionText}>
            SMS Forwarder collects the following data{' '}
            <Text style={styles.bold}>only when you receive SMS messages</Text>:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Sender phone number or name</Text>
            <Text style={styles.bulletItem}>• SMS message content</Text>
            <Text style={styles.bulletItem}>
              • Timestamp of when message was received
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#059669" />
            <Text style={styles.sectionTitle}>Data Storage</Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              ✓ All data is stored{' '}
              <Text style={styles.bold}>locally on your device only</Text>
            </Text>
            <Text style={styles.highlightText}>
              ✓ We do <Text style={styles.bold}>NOT</Text> have any servers or
              cloud storage
            </Text>
            <Text style={styles.highlightText}>
              ✓ We do <Text style={styles.bold}>NOT</Text> collect analytics or
              tracking data
            </Text>
            <Text style={styles.highlightText}>
              ✓ We <Text style={styles.bold}>CANNOT</Text> access your data - it
              never leaves your device
            </Text>
            <Text style={styles.highlightText}>
              ✓ Local storage is encrypted at rest using a device-protected key
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wifi size={20} color="#0057FF" />
            <Text style={styles.sectionTitle}>Data Forwarding</Text>
          </View>
          <Text style={styles.sectionText}>
            When you configure a webhook URL:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • SMS data is sent{' '}
              <Text style={styles.bold}>only to the URL you specify</Text>
            </Text>
            <Text style={styles.bulletItem}>
              • You have <Text style={styles.bold}>complete control</Text> over
              where your data goes
            </Text>
            <Text style={styles.bulletItem}>
              • No data is ever sent to our servers (we don't have any!)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Sharing</Text>
          <View style={styles.noShareBox}>
            <Text style={styles.noShareText}>
              We do NOT share, sell, or transfer your data to any third parties.
              Period.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.sectionText}>
            You can delete all stored data at any time from the Settings screen.
            Since all data is local, uninstalling the app removes everything.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: January 2026</Text>
          <Text style={styles.footerText}>SMS Forwarder v1.0.0</Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0057FF',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
  },
  bulletList: {
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 24,
  },
  highlightBox: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  highlightText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 24,
  },
  noShareBox: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  noShareText: {
    fontSize: 14,
    color: '#991b1b',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});
