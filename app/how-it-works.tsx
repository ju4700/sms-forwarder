import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  Smartphone,
  Filter,
  Send,
  Database,
  ArrowRight,
  CheckCircle,
} from 'lucide-react-native';

export default function HowItWorksScreen() {
  const router = useRouter();

  const steps = [
    {
      icon: <Smartphone size={28} color="#ffffff" />,
      title: 'SMS Received',
      description:
        'Your phone receives an incoming SMS message from any sender.',
      color: '#0057FF',
    },
    {
      icon: <Filter size={28} color="#ffffff" />,
      title: 'Local Filtering',
      description:
        'The app checks if the message matches your keyword filters. All filtering happens on your device.',
      color: '#7c3aed',
    },
    {
      icon: <Database size={28} color="#ffffff" />,
      title: 'Local Storage',
      description:
        'Message is logged locally on your device. No cloud storage, no external servers.',
      color: '#059669',
    },
    {
      icon: <Send size={28} color="#ffffff" />,
      title: 'Forward (Optional)',
      description:
        'If configured, matching messages are sent to YOUR webhook URL. You control the destination.',
      color: '#dc2626',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How It Works</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <HelpCircle size={40} color="#0057FF" />
          </View>
          <Text style={styles.heroTitle}>100% Local Processing</Text>
          <Text style={styles.heroSubtitle}>
            Your SMS data stays on your device. We have no servers, no cloud, no
            analytics.
          </Text>
        </View>

        <View style={styles.guaranteeBox}>
          <CheckCircle size={24} color="#059669" />
          <View style={styles.guaranteeText}>
            <Text style={styles.guaranteeTitle}>Our Privacy Guarantee</Text>
            <Text style={styles.guaranteeDescription}>
              We literally cannot access your data because we don't have any
              servers. Everything runs locally on your phone.
            </Text>
          </View>
        </View>

        <Text style={styles.flowTitle}>How SMS Forwarding Works</Text>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index}>
              <View style={styles.stepCard}>
                <View
                  style={[styles.stepIcon, { backgroundColor: step.color }]}
                >
                  {step.icon}
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
              {index < steps.length - 1 && (
                <View style={styles.arrowContainer}>
                  <ArrowRight
                    size={20}
                    color="#d1d5db"
                    style={{ transform: [{ rotate: '90deg' }] }}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Data Is Processed?</Text>
          <View style={styles.dataList}>
            <View style={styles.dataItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.dataText}>
                Sender ID (phone number or name)
              </Text>
            </View>
            <View style={styles.dataItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.dataText}>Message content</Text>
            </View>
            <View style={styles.dataItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.dataText}>Timestamp</Text>
            </View>
            <View style={styles.dataItem}>
              <CheckCircle size={16} color="#059669" />
              <Text style={styles.dataText}>Matched keywords (if any)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where Is Data Stored?</Text>
          <View style={styles.storageInfo}>
            <Text style={styles.storageText}>
              📱 <Text style={styles.bold}>On your device</Text> - Using encrypted
              local storage (AsyncStorage)
            </Text>
            <Text style={styles.storageText}>
              ❌ <Text style={styles.bold}>NOT on any cloud</Text> - We don't
              have servers
            </Text>
            <Text style={styles.storageText}>
              🗑️ <Text style={styles.bold}>Clear anytime</Text> - Delete all
              data from Settings
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who Receives Forwarded Data?</Text>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Only the webhook URL you configure.</Text>{' '}
            This is typically your own server, automation platform (like Zapier,
            Make, n8n), or business system.
          </Text>
          <Text style={styles.sectionText}>
            We never see this data. It goes directly from your phone to your
            webhook.
          </Text>
        </View>

        <View style={styles.footer}>
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
    marginBottom: 24,
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
    lineHeight: 22,
  },
  guaranteeBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderWidth: 1,
    borderColor: '#86efac',
    marginBottom: 32,
  },
  guaranteeText: {
    flex: 1,
    marginLeft: 12,
  },
  guaranteeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
  },
  guaranteeDescription: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 20,
  },
  flowTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepsContainer: {
    marginBottom: 32,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  stepIcon: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepNumber: {
    position: 'absolute',
    top: -8,
    right: 0,
    width: 24,
    height: 24,
    backgroundColor: '#0057FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 8,
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
  bold: {
    fontWeight: '700',
  },
  dataList: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
  },
  storageInfo: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderWidth: 1,
    borderColor: '#0057FF',
  },
  storageText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 26,
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
  },
});
