import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmsMessage } from '@/modules/sms-listener';

const CONFIG_KEY = '@sms_forwarder_config';
const STATS_KEY = '@sms_forwarder_stats';
const SMS_LOGS_KEY = '@sms_forwarder_logs';
const FORWARDED_LOGS_KEY = '@sms_forwarder_forwarded';

export type ForwarderConfig = {
  apiEndpoint: string;
  enabled: boolean;
  filterKeywords: string[];
};

export type ForwarderStats = {
  totalReceived: number;
  totalForwarded: number;
  lastForwarded: string | null;
  errors: number;
};

export type SmsLog = {
  id: string;
  sender: string;
  content: string;
  receivedAt: string;
  forwarded: boolean;
};

export type ForwardedLog = {
  id: string;
  sender: string;
  content: string;
  receivedAt: string;
  forwardedAt: string;
  success: boolean;
  matchedKeyword: string | null;
};

const DEFAULT_CONFIG: ForwarderConfig = {
  apiEndpoint: '',
  enabled: false,
  filterKeywords: ['payment', 'transaction', 'received', 'sent', 'balance'],
};

const DEFAULT_STATS: ForwarderStats = {
  totalReceived: 0,
  totalForwarded: 0,
  lastForwarded: null,
  errors: 0,
};

// Config functions
export async function getConfig(): Promise<ForwarderConfig> {
  try {
    const data = await AsyncStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: ForwarderConfig): Promise<void> {
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// Stats functions
export async function getStats(): Promise<ForwarderStats> {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

async function updateStats(update: Partial<ForwarderStats>): Promise<void> {
  const stats = await getStats();
  const newStats = { ...stats, ...update };
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
}

export async function resetStats(): Promise<void> {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(DEFAULT_STATS));
}

// SMS Logs functions (all received SMS)
export async function getSmsLogs(): Promise<SmsLog[]> {
  try {
    const data = await AsyncStorage.getItem(SMS_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function saveSmsLog(log: SmsLog): Promise<void> {
  const logs = await getSmsLogs();
  const updatedLogs = [log, ...logs].slice(0, 100); // Keep last 100 logs
  await AsyncStorage.setItem(SMS_LOGS_KEY, JSON.stringify(updatedLogs));
}

export async function clearSmsLogs(): Promise<void> {
  await AsyncStorage.setItem(SMS_LOGS_KEY, JSON.stringify([]));
}

// Forwarded Logs functions
export async function getForwardedLogs(): Promise<ForwardedLog[]> {
  try {
    const data = await AsyncStorage.getItem(FORWARDED_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

async function saveForwardedLog(log: ForwardedLog): Promise<void> {
  const logs = await getForwardedLogs();
  const updatedLogs = [log, ...logs].slice(0, 100); // Keep last 100 logs
  await AsyncStorage.setItem(FORWARDED_LOGS_KEY, JSON.stringify(updatedLogs));
}

export async function clearForwardedLogs(): Promise<void> {
  await AsyncStorage.setItem(FORWARDED_LOGS_KEY, JSON.stringify([]));
}

// Check if SMS should be forwarded based on keyword filters
export function shouldForwardSms(message: SmsMessage, config: ForwarderConfig): { shouldForward: boolean; matchedKeyword: string | null } {
  if (!config.enabled) {
    return { shouldForward: false, matchedKeyword: null };
  }

  if (config.filterKeywords.length === 0) {
    // If no keywords specified, forward all
    return { shouldForward: true, matchedKeyword: null };
  }

  // Check if content contains any filter keywords
  const contentLower = message.content.toLowerCase();
  for (const keyword of config.filterKeywords) {
    if (contentLower.includes(keyword.toLowerCase())) {
      return { shouldForward: true, matchedKeyword: keyword };
    }
  }

  return { shouldForward: false, matchedKeyword: null };
}

// Forward SMS to API
export async function forwardSms(message: SmsMessage, config: ForwarderConfig, matchedKeyword: string | null): Promise<boolean> {
  const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    if (!config.apiEndpoint) {
      throw new Error('API endpoint not configured');
    }

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: message.sender,
        content: message.content,
        receivedAt: new Date(message.timestamp).toISOString(),
        matchedKeyword,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    // Save successful forward log
    await saveForwardedLog({
      id: logId,
      sender: message.sender,
      content: message.content,
      receivedAt: new Date(message.timestamp).toISOString(),
      forwardedAt: new Date().toISOString(),
      success: true,
      matchedKeyword,
    });

    const stats = await getStats();
    await updateStats({
      totalForwarded: stats.totalForwarded + 1,
      lastForwarded: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error forwarding SMS:', error);

    // Save failed forward log
    await saveForwardedLog({
      id: logId,
      sender: message.sender,
      content: message.content,
      receivedAt: new Date(message.timestamp).toISOString(),
      forwardedAt: new Date().toISOString(),
      success: false,
      matchedKeyword,
    });

    const stats = await getStats();
    await updateStats({
      errors: stats.errors + 1,
    });
    return false;
  }
}

// Process incoming SMS
export async function processSms(message: SmsMessage): Promise<void> {
  const config = await getConfig();
  const stats = await getStats();

  // Always update received count
  await updateStats({
    totalReceived: stats.totalReceived + 1,
  });

  const { shouldForward, matchedKeyword } = shouldForwardSms(message, config);
  
  // Save to SMS logs
  const logId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await saveSmsLog({
    id: logId,
    sender: message.sender,
    content: message.content,
    receivedAt: new Date(message.timestamp).toISOString(),
    forwarded: shouldForward,
  });

  if (shouldForward) {
    await forwardSms(message, config, matchedKeyword);
  }
}
