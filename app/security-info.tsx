import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Settings,
  CheckCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react-native';

export default function SecurityInfoScreen() {
  const router = useRouter();

  const openAppSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Info</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Shield size={40} color="#0057FF" />
          </View>
          <Text style={styles.heroTitle}>Play Protect Warning</Text>
          <Text style={styles.heroSubtitle}>
            Understanding why you see a warning and why this app is safe
          </Text>
        </View>

        <View style={styles.warningBox}>
          <AlertTriangle size={24} color="#d97706" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Why am I seeing a warning?</Text>
            <Text style={styles.warningText}>
              Google Play Protect flags apps that use SMS permissions when
              installed outside the Play Store. This is a security feature, not
              a bug.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why This Happens</Text>
          <Text style={styles.sectionText}>
            Android's Play Protect automatically scans apps for potentially
            harmful behavior. Since this app reads SMS messages, it triggers a
            warning because:
          </Text>
          <View style={styles.reasonList}>
            <View style={styles.reasonItem}>
              <Text style={styles.reasonNumber}>1</Text>
              <Text style={styles.reasonText}>
                <Text style={styles.bold}>SMS permissions are sensitive</Text> -
                They can be misused by malicious apps for financial fraud
              </Text>
            </View>
            <View style={styles.reasonItem}>
              <Text style={styles.reasonNumber}>2</Text>
              <Text style={styles.reasonText}>
                <Text style={styles.bold}>App is sideloaded</Text> - Apps
                installed via APK (not from Play Store) get extra scrutiny
              </Text>
            </View>
            <View style={styles.reasonItem}>
              <Text style={styles.reasonNumber}>3</Text>
              <Text style={styles.reasonText}>
                <Text style={styles.bold}>Protection by default</Text> - Google
                restricts these permissions to protect users from scams
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.safeBox}>
          <CheckCircle size={24} color="#059669" />
          <View style={styles.safeContent}>
            <Text style={styles.safeTitle}>Why This App Is Safe</Text>
            <View style={styles.safeList}>
              <Text style={styles.safeItem}>
                ✓ 100% open source - you can verify the code
              </Text>
              <Text style={styles.safeItem}>
                ✓ No cloud servers - data stays on your device
              </Text>
              <Text style={styles.safeItem}>✓ No analytics or tracking</Text>
              <Text style={styles.safeItem}>
                ✓ You control where data is forwarded
              </Text>
              <Text style={styles.safeItem}>
                ✓ No accounts or sign-ups required
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            How to Enable Restricted Settings
          </Text>
          <Text style={styles.sectionText}>
            To grant SMS permissions, you'll need to enable "Restricted
            Settings" for this app:
          </Text>

          <View style={styles.stepsBox}>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Open your device <Text style={styles.bold}>Settings</Text>
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Go to <Text style={styles.bold}>Apps</Text> →{' '}
                <Text style={styles.bold}>SMS Forwarder</Text>
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Tap the <Text style={styles.bold}>⋮</Text> menu (three dots) in
                the top right
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Select{' '}
                <Text style={styles.bold}>"Allow restricted settings"</Text>
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>5</Text>
              </View>
              <Text style={styles.stepText}>
                Return to the app and grant SMS permissions
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openAppSettings}
          >
            <Settings size={20} color="#ffffff" />
            <Text style={styles.settingsButtonText}>Open App Settings</Text>
            <ExternalLink size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <HelpCircle size={18} color="#0057FF" />
              <Text style={styles.faqQuestionText}>
                Will this app steal my data?
              </Text>
            </View>
            <Text style={styles.faqAnswer}>
              No. The app has no servers and cannot access your data remotely.
              All processing happens locally on your device. Data is only
              forwarded to a webhook URL that YOU configure.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <HelpCircle size={18} color="#0057FF" />
              <Text style={styles.faqQuestionText}>
                Why isn't this on the Play Store?
              </Text>
            </View>
            <Text style={styles.faqAnswer}>
              Google has strict policies about apps that use SMS permissions.
              Most SMS apps are only allowed if they're the default SMS handler.
              We're working on Play Store submission.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <HelpCircle size={18} color="#0057FF" />
              <Text style={styles.faqQuestionText}>
                Can I verify the app is safe?
              </Text>
            </View>
            <Text style={styles.faqAnswer}>
              Yes! The app is open source. You can review the code on GitHub and
              even build it yourself to ensure there's no malicious code.
            </Text>
          </View>
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderWidth: 1,
    borderColor: '#fcd34d',
    marginBottom: 24,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
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
  reasonList: {
    marginTop: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reasonNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginRight: 12,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  safeBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderWidth: 1,
    borderColor: '#86efac',
    marginBottom: 24,
  },
  safeContent: {
    flex: 1,
    marginLeft: 12,
  },
  safeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  safeList: {},
  safeItem: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 24,
  },
  stepsBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    backgroundColor: '#0057FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0057FF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  settingsButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  faqSection: {
    marginBottom: 24,
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    paddingLeft: 26,
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
