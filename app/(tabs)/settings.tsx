import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Save, RefreshCw, Trash2 } from 'lucide-react-native';
import {
  getConfig,
  saveConfig,
  resetStats,
  clearSmsLogs,
  clearForwardedLogs,
  ForwarderConfig,
} from '@/services/sms-forwarder';

export default function SettingsScreen() {
  const [config, setConfig] = useState<ForwarderConfig>({
    apiEndpoint: '',
    enabled: false,
    filterKeywords: [],
  });
  const [keywordInput, setKeywordInput] = useState('');
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
        filterKeywords: [
          ...config.filterKeywords,
          keywordInput.trim().toLowerCase(),
        ],
      });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setConfig({
      ...config,
      filterKeywords: config.filterKeywords.filter((k) => k !== keyword),
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

  const handleClearLogs = () => {
    Alert.alert(
      'Clear All Logs',
      'Are you sure you want to clear all SMS and forwarded logs? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearSmsLogs();
            await clearForwardedLogs();
            Alert.alert('Success', 'All logs have been cleared');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Webhook URL</Text>
          <TextInput
            style={styles.input}
            value={config.apiEndpoint}
            onChangeText={(text) => setConfig({ ...config, apiEndpoint: text })}
            placeholder="https://your-server.com/sms/webhook"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text style={styles.helpText}>
            SMS data will be sent to this URL via POST request
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter Keywords</Text>
        <Text style={styles.sectionDescription}>
          SMS messages containing any of these keywords will be forwarded. Leave
          empty to forward all messages.
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            value={keywordInput}
            onChangeText={setKeywordInput}
            placeholder="Enter keyword"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddKeyword}>
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

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Save size={20} color="#ffffff" />
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleResetStats}
        >
          <RefreshCw size={18} color="#e11d48" />
          <Text style={styles.dangerButtonText}>Reset Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dangerButton, { marginTop: 8 }]}
          onPress={handleClearLogs}
        >
          <Trash2 size={18} color="#e11d48" />
          <Text style={styles.dangerButtonText}>Clear All Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          1. Enable monitoring in the Monitor tab
        </Text>
        <Text style={styles.infoText}>
          2. Add keywords to filter which SMS to forward
        </Text>
        <Text style={styles.infoText}>
          3. Configure your webhook URL to receive SMS data
        </Text>
        <Text style={styles.infoText}>
          4. Matching SMS will be sent to your webhook as JSON
        </Text>
      </View>
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
  section: {
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
  },
  flexInput: {
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#0057FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
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
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#0057FF',
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
  tagRemove: {
    fontSize: 18,
    color: '#0057FF',
    fontWeight: '600',
    lineHeight: 18,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0057FF',
    paddingVertical: 16,
    marginBottom: 32,
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
    backgroundColor: '#fff1f2',
    padding: 24,
    borderWidth: 1,
    borderColor: '#fb7185',
    marginBottom: 32,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e11d48',
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e11d48',
  },
  dangerButtonText: {
    color: '#e11d48',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 4,
  },
});
