import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Shield, ShieldOff, PlayCircle, PauseCircle, Smartphone } from 'lucide-react-native';
import { useSmsListener, requestSmsPermissions, checkSmsPermissions, simulateIncomingSms, SmsMessage } from '@/modules/sms-listener';
import { getConfig, getStats, processSms, ForwarderStats, ForwarderConfig, saveConfig } from '@/services/sms-forwarder';

export default function MonitorScreen() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [config, setConfig] = useState<ForwarderConfig | null>(null);
  const [stats, setStats] = useState<ForwarderStats | null>(null);
  const [lastMessage, setLastMessage] = useState<SmsMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [configData, statsData, perms] = await Promise.all([
      getConfig(),
      getStats(),
      checkSmsPermissions(),
    ]);
    setConfig(configData);
    setStats(statsData);
    setHasPermissions(perms);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useSmsListener(useCallback(async (message: SmsMessage) => {
    setLastMessage(message);
    await processSms(message);
    await loadData();
  }, [loadData]));

  const handleRequestPermissions = async () => {
    const granted = await requestSmsPermissions();
    setHasPermissions(granted);
    if (!granted) {
      Alert.alert(
        'Permission Denied',
        'SMS permissions are required for this app to work. Please grant permissions in your device settings.'
      );
    }
  };

  const handleToggleMonitoring = async () => {
    if (!config) return;

    if (!config.enabled && !config.apiEndpoint) {
      Alert.alert(
        'Configuration Required',
        'Please configure the API endpoint in Settings before enabling monitoring.'
      );
      return;
    }

    const newConfig = { ...config, enabled: !config.enabled };
    await saveConfig(newConfig);
    setConfig(newConfig);
  };

  const handleTestSms = () => {
    simulateIncomingSms(
      'bKash',
      'You have received BDT 500.00 from 01712345678. TrxID: ABC123XYZ Fee: BDT 0.00. Balance: BDT 1000.00'
    );
  };

  if (!config || !stats) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          {config.enabled ? (
            <Shield size={32} color="#16a34a" />
          ) : (
            <ShieldOff size={32} color="#dc2626" />
          )}
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>
              {config.enabled ? 'Monitoring Active' : 'Monitoring Disabled'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {hasPermissions ? 'Permissions granted' : 'Permissions required'}
            </Text>
          </View>
        </View>

        {!hasPermissions && (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermissions}>
            <Smartphone size={20} color="#ffffff" />
            <Text style={styles.permissionButtonText}>Grant SMS Permissions</Text>
          </TouchableOpacity>
        )}

        {hasPermissions && (
          <TouchableOpacity
            style={[
              styles.toggleButton,
              config.enabled ? styles.toggleButtonActive : styles.toggleButtonInactive,
            ]}
            onPress={handleToggleMonitoring}>
            {config.enabled ? (
              <PauseCircle size={20} color="#ffffff" />
            ) : (
              <PlayCircle size={20} color="#ffffff" />
            )}
            <Text style={styles.toggleButtonText}>
              {config.enabled ? 'Stop Monitoring' : 'Start Monitoring'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalReceived}</Text>
          <Text style={styles.statLabel}>SMS Received</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalForwarded}</Text>
          <Text style={styles.statLabel}>Forwarded</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.errors}</Text>
          <Text style={styles.statLabel}>Errors</Text>
        </View>
      </View>

      {stats.lastForwarded && (
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Last Forwarded</Text>
          <Text style={styles.infoValue}>
            {new Date(stats.lastForwarded).toLocaleString()}
          </Text>
        </View>
      )}

      {lastMessage && (
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Last Received Message</Text>
          <View style={styles.messageDetails}>
            <Text style={styles.messageLabel}>From:</Text>
            <Text style={styles.messageValue}>{lastMessage.sender}</Text>
          </View>
          <View style={styles.messageDetails}>
            <Text style={styles.messageLabel}>Time:</Text>
            <Text style={styles.messageValue}>
              {new Date(lastMessage.timestamp).toLocaleString()}
            </Text>
          </View>
          <View style={styles.messageContent}>
            <Text style={styles.messageLabel}>Content:</Text>
            <Text style={styles.messageText}>{lastMessage.content}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.testButton} onPress={handleTestSms}>
        <Text style={styles.testButtonText}>Simulate Test SMS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#dc2626',
  },
  toggleButtonInactive: {
    backgroundColor: '#16a34a',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  messageDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 60,
  },
  messageValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  messageContent: {
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#111827',
    marginTop: 4,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  testButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
