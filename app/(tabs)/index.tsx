import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Shield,
  ShieldOff,
  PlayCircle,
  PauseCircle,
  Smartphone,
} from 'lucide-react-native';
import {
  useSmsListener,
  requestSmsPermissions,
  checkSmsPermissions,
  simulateIncomingSms,
  SmsMessage,
} from '@/modules/sms-listener';
import {
  getConfig,
  getStats,
  processSms,
  ForwarderStats,
  ForwarderConfig,
  saveConfig,
  getSmsLogs,
  getForwardedLogs,
} from '@/services/sms-forwarder';
import { startForegroundService, stopForegroundService } from '@/modules/foreground-service';

export default function MonitorScreen() {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [config, setConfig] = useState<ForwarderConfig | null>(null);
  const [stats, setStats] = useState<ForwarderStats | null>(null);
  const [lastMessage, setLastMessage] = useState<SmsMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [configData, statsData, perms, smsLogs] = await Promise.all([
      getConfig(),
      getStats(),
      checkSmsPermissions(),
      getSmsLogs(),
    ]);
    setConfig(configData);
    setStats(statsData);
    setHasPermissions(perms);
    
    // Load the most recent message if available
    if (smsLogs.length > 0) {
      const latestLog = smsLogs[0];
      setLastMessage({
        id: latestLog.id,
        sender: latestLog.sender,
        content: latestLog.content,
        timestamp: new Date(latestLog.receivedAt).getTime(),
      });
    }
  }, []);

  const syncForegroundNotification = useCallback(async () => {
    const [statsData, forwardedLogs] = await Promise.all([
      getStats(),
      getForwardedLogs(),
    ]);
    const recentMessages = forwardedLogs
      .filter(log => log.success)
      .slice(0, 5)
      .map(log => `${log.sender}: ${log.content.replace(/\s+/g, ' ').trim().slice(0, 60)}`);
    startForegroundService(statsData.totalForwarded, recentMessages);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await loadData();
      // Request SMS permissions on app startup if not already granted
      const hasPerms = await checkSmsPermissions();
      if (!hasPerms) {
        const granted = await requestSmsPermissions();
        setHasPermissions(granted);
        if (granted) {
          await loadData();
        }
      }
      const configData = await getConfig();
      if (configData.enabled) {
        await syncForegroundNotification();
      }
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useSmsListener(
    useCallback(
      async (message: SmsMessage) => {
        setLastMessage(message);
        await processSms(message);
        await loadData();
      },
      [loadData]
    )
  );

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
        'Please configure the webhook URL in Settings before enabling monitoring.'
      );
      return;
    }

    const newConfig = { ...config, enabled: !config.enabled };
    await saveConfig(newConfig);
    setConfig(newConfig);
    if (newConfig.enabled) {
      await syncForegroundNotification();
    } else {
      stopForegroundService();
    }
  };

  const handleTestSms = () => {
    simulateIncomingSms(
      'TestSender',
      'This is a test SMS message with payment keyword. Transaction ID: TEST123'
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
      }
    >
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          {config.enabled ? (
            <Shield size={32} color="#0057FF" />
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
            onPress={handleRequestPermissions}
          >
            <Smartphone size={20} color="#ffffff" />
            <Text style={styles.permissionButtonText}>
              Grant SMS Permissions
            </Text>
          </TouchableOpacity>
        )}

        {hasPermissions && (
          <TouchableOpacity
            style={[
              styles.toggleButton,
              config.enabled
                ? styles.toggleButtonActive
                : styles.toggleButtonInactive,
            ]}
            onPress={handleToggleMonitoring}
          >
            {config.enabled ? (
              <PauseCircle size={20} color="#dc2626" />
            ) : (
              <PlayCircle size={20} color="#ffffff" />
            )}
            <Text
              style={[
                styles.toggleButtonText,
                { color: config.enabled ? '#dc2626' : '#ffffff' },
              ]}
            >
              {config.enabled ? 'Stop Monitoring' : 'Start Monitoring'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalReceived}</Text>
          <Text style={styles.statLabel}>Received</Text>
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
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 24,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  permissionButton: {
    backgroundColor: '#0057FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    borderWidth: 1,
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#dc2626',
  },
  toggleButtonInactive: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0057FF',
    marginBottom: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  messageDetails: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  messageLabel: {
    fontSize: 13,
    color: '#6b7280',
    width: 60,
    fontWeight: '500',
  },
  messageValue: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
    fontWeight: '500',
  },
  messageContent: {
    marginTop: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});
