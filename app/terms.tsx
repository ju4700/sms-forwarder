import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';

export default function TermsScreen() {
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <FileText size={40} color="#0057FF" />
          </View>
          <Text style={styles.heroTitle}>Terms of Use</Text>
          <Text style={styles.heroSubtitle}>
            Please read these terms carefully before using the app
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By downloading, installing, or using SMS Forwarder, you agree to be
            bound by these Terms and Conditions. If you do not agree, please
            uninstall the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.sectionText}>
            SMS Forwarder is a utility application that:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • Monitors incoming SMS messages on your device
            </Text>
            <Text style={styles.bulletItem}>
              • Filters messages based on keywords you define
            </Text>
            <Text style={styles.bulletItem}>
              • Forwards matching messages to a webhook URL you configure
            </Text>
            <Text style={styles.bulletItem}>
              • Stores message logs locally on your device
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
          <Text style={styles.sectionText}>You are responsible for:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • Ensuring you have the legal right to forward SMS messages
            </Text>
            <Text style={styles.bulletItem}>
              • Configuring secure and appropriate webhook endpoints
            </Text>
            <Text style={styles.bulletItem}>
              • Complying with all applicable laws and regulations
            </Text>
            <Text style={styles.bulletItem}>
              • Protecting your device and the webhook credentials you configure
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Permitted Use</Text>
          <Text style={styles.sectionText}>
            This app is intended for legitimate purposes such as:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Business SMS automation</Text>
            <Text style={styles.bulletItem}>
              • Personal notification forwarding
            </Text>
            <Text style={styles.bulletItem}>
              • Payment notification tracking
            </Text>
            <Text style={styles.bulletItem}>
              • Integration with business systems
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Prohibited Use</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              You must NOT use this app for:
            </Text>
            <Text style={styles.warningItem}>
              ✗ Unauthorized access to others' messages
            </Text>
            <Text style={styles.warningItem}>
              ✗ Fraudulent or illegal activities
            </Text>
            <Text style={styles.warningItem}>✗ Stalking or harassment</Text>
            <Text style={styles.warningItem}>
              ✗ Any activity that violates privacy laws
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Disclaimer of Warranties</Text>
          <Text style={styles.sectionText}>
            This app is provided "AS IS" without warranty of any kind. We do not
            guarantee that the app will be error-free or uninterrupted. Message
            delivery to your configured webhook depends on network conditions
            and your server's availability.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            We shall not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of this app, including
            but not limited to missed messages, failed forwards, or data loss.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We may update these terms from time to time. Continued use of the
            app after changes constitutes acceptance of the new terms.
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  warningText: {
    fontSize: 14,
    color: '#991b1b',
    fontWeight: '600',
    marginBottom: 12,
  },
  warningItem: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 24,
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
