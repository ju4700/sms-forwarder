import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
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
    customJsonTemplate: '',
    allowedSenders: [],
    blockedSenders: [],
    customHeaders: {},
    retryAttempts: 0,
    retryDelay: 1000,
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [senderInput, setSenderInput] = useState('');
  const [senderType, setSenderType] = useState<'allow' | 'block'>('allow');
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showJsonTemplate, setShowJsonTemplate] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

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

    // Validate URL format and enforce HTTPS
    try {
      const url = new URL(config.apiEndpoint.trim());
      if (url.protocol !== 'https:') {
        Alert.alert(
          'Error',
          'HTTPS is required for security. Please use an https:// URL.'
        );
        return;
      }
    } catch {
      Alert.alert(
        'Error',
        'Please enter a valid URL (e.g., https://example.com/api/sms)'
      );
      return;
    }

    try {
      setSaving(true);
      const configToSave = {
        ...config,
        apiEndpoint: config.apiEndpoint.trim(),
      };
      await saveConfig(configToSave);
      setConfig(configToSave);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!config.apiEndpoint.trim()) {
      Alert.alert('Error', 'API endpoint is required');
      return;
    }

    try {
      const url = new URL(config.apiEndpoint.trim());
      if (url.protocol !== 'https:') {
        Alert.alert(
          'Error',
          'HTTPS is required for security. Please use an https:// URL.'
        );
        return;
      }
    } catch {
      Alert.alert(
        'Error',
        'Please enter a valid URL (e.g., https://example.com/api/sms)'
      );
      return;
    }

    setTestingWebhook(true);
    setWebhookStatus(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(config.apiEndpoint.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SMS-Forwarder-Test': 'true',
        },
        body: JSON.stringify({
          test: true,
          sender: 'TestSender',
          content: 'Test SMS from SMS Forwarder',
          receivedAt: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        setWebhookStatus('Webhook reachable. Test request succeeded.');
      } else {
        setWebhookStatus(`Webhook responded with HTTP ${response.status}.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setWebhookStatus(`Webhook test failed: ${message}`);
    } finally {
      clearTimeout(timeoutId);
      setTestingWebhook(false);
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
            SMS data will be sent to this URL via POST request (HTTPS only)
          </Text>
          <TouchableOpacity
            style={[styles.testButton, testingWebhook && styles.testButtonDisabled]}
            onPress={handleTestWebhook}
            disabled={testingWebhook}
          >
            <Text style={styles.testButtonText}>
              {testingWebhook ? 'Testing...' : 'Test Webhook'}
            </Text>
          </TouchableOpacity>
          {webhookStatus && (
            <Text style={styles.webhookStatusText}>{webhookStatus}</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom JSON Template (Optional)</Text>
        <Text style={styles.sectionDescription}>
          Define custom JSON structure to send to your API. Leave empty to use
          default format.
        </Text>
        <Text style={styles.helpText}>
          Available variables: {'{'}sender{'}'}, {'{'}content{'}'}, {'{'}
          receivedAt{'}'}, {'{'}transactionId{'}'}, {'{'}amount{'}'}, {'{'}
          matchedKeyword{'}'}
        </Text>
        <Text style={styles.helpText}>
          Custom regex: {'{'}regex:pattern:group{'}'} - e.g., {'{'}
          regex:Code:\s*(\d+):1{'}'}
        </Text>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowJsonTemplate(!showJsonTemplate)}
        >
          <Text style={styles.toggleButtonText}>
            {showJsonTemplate ? 'Hide' : 'Show'} JSON Template Editor
          </Text>
        </TouchableOpacity>

        {showJsonTemplate && (
          <TextInput
            style={[styles.input, styles.jsonInput]}
            value={config.customJsonTemplate || ''}
            onChangeText={(text) =>
              setConfig({ ...config, customJsonTemplate: text })
            }
            placeholder={`{\n  "transactionId": "{{transactionId}}",\n  "amount": {{amount}},\n  "sender": "{{sender}}"\n}`}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}

        {config.customJsonTemplate && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setConfig({ ...config, customJsonTemplate: '' })}
          >
            <Text style={styles.clearButtonText}>
              Clear Template (Use Default)
            </Text>
          </TouchableOpacity>
        )}
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sender Filtering</Text>
        <Text style={styles.sectionDescription}>
          Control which senders to forward SMS from. Leave empty to allow all
          senders.
        </Text>
        <Text style={styles.helpText}>
          Tip: Use * for partial matches (e.g., *bkash*)
        </Text>

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              senderType === 'allow' && styles.tabButtonActive,
            ]}
            onPress={() => setSenderType('allow')}
          >
            <Text
              style={[
                styles.tabButtonText,
                senderType === 'allow' && styles.tabButtonTextActive,
              ]}
            >
              Whitelist
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              senderType === 'block' && styles.tabButtonActive,
            ]}
            onPress={() => setSenderType('block')}
          >
            <Text
              style={[
                styles.tabButtonText,
                senderType === 'block' && styles.tabButtonTextActive,
              ]}
            >
              Blacklist
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            value={senderInput}
            onChangeText={setSenderInput}
            placeholder={
              senderType === 'allow'
                ? 'Add allowed sender (e.g., bKash)'
                : 'Add blocked sender'
            }
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (!senderInput.trim()) return;
              const list =
                senderType === 'allow'
                  ? config.allowedSenders || []
                  : config.blockedSenders || [];
              if (!list.includes(senderInput.trim().toLowerCase())) {
                if (senderType === 'allow') {
                  setConfig({
                    ...config,
                    allowedSenders: [
                      ...(config.allowedSenders || []),
                      senderInput.trim().toLowerCase(),
                    ],
                  });
                } else {
                  setConfig({
                    ...config,
                    blockedSenders: [
                      ...(config.blockedSenders || []),
                      senderInput.trim().toLowerCase(),
                    ],
                  });
                }
                setSenderInput('');
              }
            }}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {senderType === 'allow' &&
          config.allowedSenders &&
          config.allowedSenders.length > 0 && (
            <View style={styles.tagContainer}>
              {config.allowedSenders.map((sender) => (
                <View key={sender} style={styles.tag}>
                  <Text style={styles.tagText}>{sender}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setConfig({
                        ...config,
                        allowedSenders:
                          config.allowedSenders?.filter((s) => s !== sender) ||
                          [],
                      })
                    }
                  >
                    <Text style={styles.tagRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

        {senderType === 'block' &&
          config.blockedSenders &&
          config.blockedSenders.length > 0 && (
            <View style={styles.tagContainer}>
              {config.blockedSenders.map((sender) => (
                <View
                  key={sender}
                  style={[
                    styles.tag,
                    { backgroundColor: '#fff1f2', borderColor: '#fb7185' },
                  ]}
                >
                  <Text style={[styles.tagText, { color: '#e11d48' }]}>
                    {sender}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setConfig({
                        ...config,
                        blockedSenders:
                          config.blockedSenders?.filter((s) => s !== sender) ||
                          [],
                      })
                    }
                  >
                    <Text style={[styles.tagRemove, { color: '#e11d48' }]}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
      </View>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowAdvanced(!showAdvanced)}
      >
        <Text style={styles.toggleButtonText}>
          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </Text>
      </TouchableOpacity>

      {showAdvanced && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Headers</Text>
            <Text style={styles.sectionDescription}>
              Add custom HTTP headers (e.g., Authorization, API-Key). Useful for
              API authentication.
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 0.4 }]}
                value={headerKey}
                onChangeText={setHeaderKey}
                placeholder="Header name"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { flex: 0.6 }]}
                value={headerValue}
                onChangeText={setHeaderValue}
                placeholder="Header value"
                autoCapitalize="none"
                secureTextEntry={
                  headerKey.toLowerCase().includes('key') ||
                  headerKey.toLowerCase().includes('token')
                }
              />
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (!headerKey.trim() || !headerValue.trim()) return;
                setConfig({
                  ...config,
                  customHeaders: {
                    ...(config.customHeaders || {}),
                    [headerKey.trim()]: headerValue.trim(),
                  },
                });
                setHeaderKey('');
                setHeaderValue('');
              }}
            >
              <Text style={styles.addButtonText}>Add Header</Text>
            </TouchableOpacity>

            {config.customHeaders &&
              Object.keys(config.customHeaders).length > 0 && (
                <View style={styles.tagContainer}>
                  {Object.entries(config.customHeaders).map(([key, value]) => (
                    <View key={key} style={styles.tag}>
                      <Text style={styles.tagText}>
                        {key}:{' '}
                        {value.length > 20
                          ? value.substring(0, 20) + '...'
                          : value}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newHeaders = {
                            ...(config.customHeaders || {}),
                          };
                          delete newHeaders[key];
                          setConfig({ ...config, customHeaders: newHeaders });
                        }}
                      >
                        <Text style={styles.tagRemove}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Retry Settings</Text>
            <Text style={styles.sectionDescription}>
              Configure automatic retry on API failures. Default: No retries.
            </Text>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { flex: 0.5, marginRight: 8 }]}>
                Retry Attempts:
              </Text>
              <TextInput
                style={[styles.input, { flex: 0.3 }]}
                value={config.retryAttempts?.toString() || '0'}
                onChangeText={(text) => {
                  const num = parseInt(text, 10) || 0;
                  setConfig({
                    ...config,
                    retryAttempts: Math.max(0, Math.min(5, num)),
                  });
                }}
                keyboardType="numeric"
                placeholder="0"
              />
              <Text style={[styles.helpText, { flex: 0.2 }]}>Max 5</Text>
            </View>

            <View style={styles.inputRow}>
              <Text style={[styles.label, { flex: 0.5, marginRight: 8 }]}>
                Retry Delay (ms):
              </Text>
              <TextInput
                style={[styles.input, { flex: 0.3 }]}
                value={config.retryDelay?.toString() || '1000'}
                onChangeText={(text) => {
                  const num = parseInt(text, 10) || 1000;
                  setConfig({
                    ...config,
                    retryDelay: Math.max(100, Math.min(10000, num)),
                  });
                }}
                keyboardType="numeric"
                placeholder="1000"
              />
              <Text style={[styles.helpText, { flex: 0.2 }]}>100-10000</Text>
            </View>
          </View>
        </>
      )}

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
      <Text style={styles.infoText}>
        Developed by{' '}
        <Text
          style={styles.infoLink}
          onPress={() => Linking.openURL('https://github.com/ju4700')}
        >
          ju4700
        </Text>
      </Text>
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
  testButton: {
    marginTop: 12,
    backgroundColor: '#111827',
    paddingVertical: 12,
    alignItems: 'center',
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  webhookStatusText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
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
  infoLink: {
    fontSize: 14,
    color: '#0057FF',
    lineHeight: 22,
    marginBottom: 4,
    textDecorationLine: 'underline',
  },
  toggleButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  toggleButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  jsonInput: {
    minHeight: 150,
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 12,
  },
  clearButton: {
    backgroundColor: '#fff1f2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fb7185',
  },
  clearButtonText: {
    color: '#e11d48',
    fontSize: 13,
    fontWeight: '600',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  tabButtonActive: {
    backgroundColor: '#0057FF',
    borderColor: '#0057FF',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
});
