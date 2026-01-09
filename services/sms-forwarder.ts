import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmsMessage } from '@/modules/sms-listener';

const CONFIG_KEY = '@sms_forwarder_config';
const STATS_KEY = '@sms_forwarder_stats';

export type ForwarderConfig = {
  apiEndpoint: string;
  enabled: boolean;
  filterKeywords: string[];
  bkashSenders: string[];
};

export type ForwarderStats = {
  totalReceived: number;
  totalForwarded: number;
  lastForwarded: string | null;
  errors: number;
};

const DEFAULT_CONFIG: ForwarderConfig = {
  apiEndpoint: '',
  enabled: false,
  filterKeywords: ['bkash', 'trxid', 'transaction'],
  bkashSenders: ['bKash', '16247', 'bKash-Pay'],
};

const DEFAULT_STATS: ForwarderStats = {
  totalReceived: 0,
  totalForwarded: 0,
  lastForwarded: null,
  errors: 0,
};

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

export function shouldForwardSms(message: SmsMessage, config: ForwarderConfig): boolean {
  if (!config.enabled) {
    return false;
  }

  // Check if sender matches bKash senders
  const senderMatches = config.bkashSenders.some(sender =>
    message.sender.toLowerCase().includes(sender.toLowerCase())
  );

  if (!senderMatches) {
    return false;
  }

  // Check if content contains any filter keywords
  const contentLower = message.content.toLowerCase();
  const hasKeyword = config.filterKeywords.some(keyword =>
    contentLower.includes(keyword.toLowerCase())
  );

  return hasKeyword;
}

export function extractReferenceId(content: string): string | null {
  const patterns = [
    /TrxID[:\s]+([A-Z0-9]+)/i,
    /Reference[:\s]+([A-Z0-9]+)/i,
    /Ref[:\s]+([A-Z0-9]+)/i,
    /Transaction[:\s]+([A-Z0-9]+)/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export async function forwardSms(message: SmsMessage, config: ForwarderConfig): Promise<boolean> {
  try {
    if (!config.apiEndpoint) {
      throw new Error('API endpoint not configured');
    }

    const referenceId = extractReferenceId(message.content);

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: message.sender,
        content: message.content,
        receivedAt: new Date(message.timestamp).toISOString(),
        referenceId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const stats = await getStats();
    await updateStats({
      totalForwarded: stats.totalForwarded + 1,
      lastForwarded: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error forwarding SMS:', error);
    const stats = await getStats();
    await updateStats({
      errors: stats.errors + 1,
    });
    return false;
  }
}

export async function processSms(message: SmsMessage): Promise<void> {
  const config = await getConfig();
  const stats = await getStats();

  await updateStats({
    totalReceived: stats.totalReceived + 1,
  });

  if (shouldForwardSms(message, config)) {
    await forwardSms(message, config);
  }
}
