import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { getSmsLogs, SmsLog } from '@/services/sms-forwarder';

export default function LogsScreen() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const data = await getSmsLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLogs();
  }, [loadLogs]);

  const renderLog = ({ item }: { item: SmsLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.senderContainer}>
          <Text style={styles.sender}>{item.sender}</Text>
        </View>
        <View style={styles.forwardedBadge}>
          {item.forwarded ? (
            <>
              <CheckCircle size={16} color="#0057FF" />
              <Text style={styles.forwardedText}>Forwarded</Text>
            </>
          ) : (
            <>
              <XCircle size={16} color="#6b7280" />
              <Text style={styles.notForwardedText}>Not Forwarded</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.logContent}>
        <Text style={styles.contentText} numberOfLines={4}>
          {item.content}
        </Text>
      </View>

      <View style={styles.logFooter}>
        <Text style={styles.timestamp}>
          {new Date(item.receivedAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0057FF" />
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        renderItem={renderLog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No SMS logs yet</Text>
            <Text style={styles.emptySubtext}>
              SMS messages received by the app will be logged here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    padding: 0,
  },
  logCard: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderContainer: {
    flex: 1,
  },
  sender: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  forwardedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  forwardedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0057FF',
  },
  notForwardedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  logContent: {
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
