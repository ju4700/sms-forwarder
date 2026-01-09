import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Save, RefreshCw, Trash2, Copy } from 'lucide-react-native';
import { getConfig, saveConfig, getStats, resetStats, ForwarderConfig } from '@/services/sms-forwarder';
import * as Clipboard from 'expo-clipboard';

export default function SettingsScreen() {
  const [config, setConfig] = useState<ForwarderConfig>({
    apiEndpoint: '',
    enabled: false,
    filterKeywords: [],
    bkashSenders: [],
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [senderInput, setSenderInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    const data = await getConfig();
    setConfig(data);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    if (!config.apiEndpoint.trim()) {
      Alert.alert('Error', 'API endpoint is required');
      return;
    }

    try {
      setSaving(true);
      await saveConfig(config);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;

    if (!config.filterKeywords.includes(keywordInput.trim().toLowerCase())) {
      setConfig({
        ...config,
        filterKeywords: [...config.filterKeywords, keywordInput.trim().toLowerCase()],
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setConfig({
      ...config,
      filterKeywords: config.filterKeywords.filter(k => k !== keyword),
    });
  };

  const handleAddSender = () => {
    if (!senderInput.trim()) return;

    if (!config.bkashSenders.includes(senderInput.trim())) {
      setConfig({
        ...config,
        bkashSenders: [...config.bkashSenders, senderInput.trim()],
      });
      setSenderInput('');
    }
  };

  const handleRemoveSender = (sender: string) => {
    setConfig({
      ...config,
      bkashSenders: config.bkashSenders.filter(s => s !== sender),
    });
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all statistics? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetStats();
            Alert.alert('Success', 'Statistics have been reset');
          },
        },
      ]
    );
  };

  const handleCopyDefaultEndpoint = async () => {
    const defaultEndpoint = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sms/forward`;
    await Clipboard.setStringAsync(defaultEndpoint);
    Alert.alert('Copied', 'Default API endpoint copied to clipboard');
  };

  const handleSetDefaultEndpoint = () => {
    const defaultEndpoint = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sms/forward`;
    setConfig({ ...config, apiEndpoint: defaultEndpoint });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>API Endpoint URL</Text>
          <TextInput
            style={styles.input}
            value={config.apiEndpoint}
            onChangeText={(text) => setConfig({ ...config, apiEndpoint: text })}
            placeholder="https://your-api.com/sms/forward"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSetDefaultEndpoint}>
              <RefreshCw size={16} color="#374151" />
              <Text style={styles.secondaryButtonText}>Use Default</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCopyDefaultEndpoint}>
              <Copy size={16} color="#374151" />
              <Text style={styles.secondaryButtonText}>Copy Default</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            Default: {process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 30)}...
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter Keywords</Text>
        <Text style={styles.sectionDescription}>
          SMS messages containing these keywords will be forwarded
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            value={keywordInput}
            onChangeText={setKeywordInput}
            placeholder="Enter keyword"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddKeyword}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagContainer}>
          {config.filterKeywords.map((keyword) => (
            <View key={keyword} style={styles.tag}>
              <Text style={styles.tagText}>{keyword}</Text>
              <TouchableOpacity onPress={() => handleRemoveKeyword(keyword)}>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>bKash Senders</Text>
        <Text style={styles.sectionDescription}>
          Only SMS from these senders will be monitored
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            value={senderInput}
            onChangeText={setSenderInput}
            placeholder="Enter sender name/number"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddSender}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagContainer}>
          {config.bkashSenders.map((sender) => (
            <View key={sender} style={styles.tag}>
              <Text style={styles.tagText}>{sender}</Text>
              <TouchableOpacity onPress={() => handleRemoveSender(sender)}>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}>
        <Save size={20} color="#ffffff" />
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleResetStats}>
          <Trash2 size={20} color="#dc2626" />
          <Text style={styles.dangerButtonText}>Reset Statistics</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>About</Text>
        <Text style={styles.infoText}>
          This app monitors incoming SMS messages from bKash and forwards them to your configured API endpoint for payment verification.
        </Text>
        <Text style={styles.infoText}>
          Make sure to grant SMS permissions and enable monitoring in the Monitor tab.
        </Text>
      </View>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  flexInput: {
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  tagRemove: {
    fontSize: 20,
    color: '#2563eb',
    fontWeight: '600',
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerZone: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    marginBottom: 8,
  },
});
