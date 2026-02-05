import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle, XCircle, Tag } from 'lucide-react-native';
import { getForwardedLogs, ForwardedLog } from '@/services/sms-forwarder';

export default function ForwardedScreen() {
  const [logs, setLogs] = useState<ForwardedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  const loadLogs = useCallback(async () => {
    try {
      const data = await getForwardedLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading forwarded logs:', error);
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

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'success') return log.success;
    if (filter === 'failed') return !log.success;
    return true;
  });

  const renderLog = ({ item }: { item: ForwardedLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.statusBadge}>
          {item.success ? (
            <>
              <CheckCircle size={18} color="#0057FF" />
              <Text style={styles.successText}>Sent</Text>
            </>
          ) : (
            <>
              <XCircle size={18} color="#dc2626" />
              <Text style={styles.failedText}>Failed</Text>
            </>
          )}
        </View>
        <Text style={styles.sender}>{item.sender}</Text>
      </View>

      <View style={styles.logContent}>
        <Text style={styles.contentText} numberOfLines={3}>
          {item.content}
        </Text>
        {!item.success && item.errorMessage ? (
          <Text style={styles.errorText} numberOfLines={2}>
            Error: {item.errorMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.logFooter}>
        <Text style={styles.timestamp}>
          {new Date(item.forwardedAt).toLocaleString()}
        </Text>
        {item.matchedKeyword && (
          <View style={styles.keywordBadge}>
            <Tag size={12} color="#0057FF" />
            <Text style={styles.keywordText}>{item.matchedKeyword}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0057FF" />
        <Text style={styles.loadingText}>Loading forwarded messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {(['all', 'success', 'failed'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === status && styles.filterButtonTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLogs}
        renderItem={renderLog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No forwarded messages</Text>
            <Text style={styles.emptySubtext}>
              Messages that match your keyword filters will appear here after
              forwarding
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  filterButtonActive: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButtonTextActive: {
    color: '#ffffff',
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
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  successText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0057FF',
    textTransform: 'uppercase',
  },
  failedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
    textTransform: 'uppercase',
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
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
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#dc2626',
    lineHeight: 18,
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
  keywordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#0057FF',
  },
  keywordText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0057FF',
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
