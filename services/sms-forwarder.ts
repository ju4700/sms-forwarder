import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';
import { SmsMessage } from '@/modules/sms-listener';

const CONFIG_KEY = '@sms_forwarder_config';
const STATS_KEY = '@sms_forwarder_stats';
const SMS_LOGS_KEY = '@sms_forwarder_logs';
const FORWARDED_LOGS_KEY = '@sms_forwarder_forwarded';
const MASTER_KEY_NAME = '@sms_forwarder_master_key';

export type ForwarderConfig = {
  apiEndpoint: string;
  enabled: boolean;
  filterKeywords: string[];
  customJsonTemplate?: string; // Custom JSON template with variables like {{sender}}, {{content}}, etc.
  allowedSenders?: string[]; // Whitelist: Only forward SMS from these senders (empty = all senders)
  blockedSenders?: string[]; // Blacklist: Never forward SMS from these senders
  customHeaders?: Record<string, string>; // Custom HTTP headers (e.g., Authorization, API-Key)
  retryAttempts?: number; // Number of retry attempts on failure (default: 0)
  retryDelay?: number; // Delay between retries in milliseconds (default: 1000)
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
  errorMessage?: string;
};

async function getMasterKey(): Promise<string | null> {
  try {
    let key = await SecureStore.getItemAsync(MASTER_KEY_NAME);
    if (!key) {
      key = CryptoJS.lib.WordArray.random(32).toString();
      await SecureStore.setItemAsync(MASTER_KEY_NAME, key);
    }
    return key;
  } catch {
    return null;
  }
}

async function encryptPayload(payload: unknown): Promise<string> {
  const key = await getMasterKey();
  const json = JSON.stringify(payload);
  if (!key) {
    return json;
  }
  return CryptoJS.AES.encrypt(json, key).toString();
}

async function decryptPayload<T>(storedValue: string): Promise<T | null> {
  const key = await getMasterKey();
  if (!key) {
    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return null;
    }
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(storedValue, key).toString(
      CryptoJS.enc.Utf8
    );
    if (!decrypted) {
      throw new Error('Empty decrypt result');
    }
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
}

async function getStoredJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    if (!storedValue) {
      return fallback;
    }

    const decrypted = await decryptPayload<T>(storedValue);
    if (decrypted !== null) {
      return decrypted;
    }

    const parsed = JSON.parse(storedValue) as T;
    await setStoredJson(key, parsed);
    return parsed;
  } catch {
    return fallback;
  }
}

async function setStoredJson<T>(key: string, value: T): Promise<void> {
  const payload = await encryptPayload(value);
  await AsyncStorage.setItem(key, payload);
}

function normalizeSender(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchesSenderFilter(sender: string, filter: string): boolean {
  const trimmedFilter = filter.trim().toLowerCase();
  if (!trimmedFilter) {
    return false;
  }

  const hasLeadingWildcard = trimmedFilter.startsWith('*');
  const hasTrailingWildcard = trimmedFilter.endsWith('*');
  const normalizedFilter = normalizeSender(
    trimmedFilter.replace(/^\*+|\*+$/g, '')
  );
  const normalizedSender = normalizeSender(sender);

  if (!normalizedFilter) {
    return false;
  }

  if (hasLeadingWildcard || hasTrailingWildcard) {
    return normalizedSender.includes(normalizedFilter);
  }

  return normalizedSender === normalizedFilter;
}

const DEFAULT_CONFIG: ForwarderConfig = {
  apiEndpoint: '',
  enabled: false,
  filterKeywords: ['payment', 'transaction', 'received', 'sent', 'balance'],
  customJsonTemplate: '', // Empty means use default JSON structure
  allowedSenders: [], // Empty = accept all senders
  blockedSenders: [], // Empty = block none
  customHeaders: {}, // No custom headers by default
  retryAttempts: 0, // No retries by default
  retryDelay: 1000, // 1 second delay between retries
};

const DEFAULT_STATS: ForwarderStats = {
  totalReceived: 0,
  totalForwarded: 0,
  lastForwarded: null,
  errors: 0,
};

// Config functions
export async function getConfig(): Promise<ForwarderConfig> {
  return getStoredJson(CONFIG_KEY, DEFAULT_CONFIG);
}

export async function saveConfig(config: ForwarderConfig): Promise<void> {
  await setStoredJson(CONFIG_KEY, config);
}

// Stats functions
export async function getStats(): Promise<ForwarderStats> {
  return getStoredJson(STATS_KEY, DEFAULT_STATS);
}

async function updateStats(update: Partial<ForwarderStats>): Promise<void> {
  const stats = await getStats();
  const newStats = { ...stats, ...update };
  await setStoredJson(STATS_KEY, newStats);
}

export async function resetStats(): Promise<void> {
  await setStoredJson(STATS_KEY, DEFAULT_STATS);
}

// SMS Logs functions (all received SMS)
export async function getSmsLogs(): Promise<SmsLog[]> {
  return getStoredJson(SMS_LOGS_KEY, []);
}

async function saveSmsLog(log: SmsLog): Promise<void> {
  const logs = await getSmsLogs();
  const updatedLogs = [log, ...logs].slice(0, 100); // Keep last 100 logs
  await setStoredJson(SMS_LOGS_KEY, updatedLogs);
}

export async function clearSmsLogs(): Promise<void> {
  await setStoredJson(SMS_LOGS_KEY, []);
}

// Forwarded Logs functions
export async function getForwardedLogs(): Promise<ForwardedLog[]> {
  return getStoredJson(FORWARDED_LOGS_KEY, []);
}

async function saveForwardedLog(log: ForwardedLog): Promise<void> {
  const logs = await getForwardedLogs();
  const updatedLogs = [log, ...logs].slice(0, 100); // Keep last 100 logs
  await setStoredJson(FORWARDED_LOGS_KEY, updatedLogs);
}

export async function clearForwardedLogs(): Promise<void> {
  await setStoredJson(FORWARDED_LOGS_KEY, []);
}

// Check if SMS should be forwarded based on filters
export function shouldForwardSms(message: SmsMessage, config: ForwarderConfig): { shouldForward: boolean; matchedKeyword: string | null; reason?: string } {
  if (!config.enabled) {
    return { shouldForward: false, matchedKeyword: null, reason: 'Monitoring disabled' };
  }

  // Check sender whitelist
  if (config.allowedSenders && config.allowedSenders.length > 0) {
    const isAllowed = config.allowedSenders.some(allowed =>
      matchesSenderFilter(message.sender, allowed)
    );
    if (!isAllowed) {
      return { shouldForward: false, matchedKeyword: null, reason: 'Sender not in whitelist' };
    }
  }

  // Check sender blacklist
  if (config.blockedSenders && config.blockedSenders.length > 0) {
    const isBlocked = config.blockedSenders.some(blocked =>
      matchesSenderFilter(message.sender, blocked)
    );
    if (isBlocked) {
      return { shouldForward: false, matchedKeyword: null, reason: 'Sender in blacklist' };
    }
  }

  // Check keyword filters
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

  return { shouldForward: false, matchedKeyword: null, reason: 'No keyword match' };
}

// Extract data from SMS content using regex patterns
function extractSmsData(content: string): {
  transactionId?: string;
  referenceId?: string;
  amount?: number;
  [key: string]: any;
} {
  const data: any = {};

  // Extract transaction/reference ID
  const refPatterns = [
    /(?:TrxID|Transaction\s*ID|Txn\s*ID)[:\s]+([A-Z0-9]+)/i,
    /(?:Reference|Ref)[:\s]+([A-Z0-9]+)/i,
    /(?:ID|Code)[:\s]+([A-Z0-9]{6,})/i,
  ];
  for (const pattern of refPatterns) {
    const match = content.match(pattern);
    if (match) {
      data.transactionId = match[1];
      data.referenceId = match[1];
      break;
    }
  }

  // Extract amount
  const amountPatterns = [
    /(?:BDT|Tk|Taka|Rs|USD|\$)[:\s]*([0-9,]+(?:\.[0-9]{2})?)/i,
    /([0-9,]+(?:\.[0-9]{2})?)[:\s]*(?:BDT|Tk|Taka|Rs|USD|\$)/i,
  ];
  for (const pattern of amountPatterns) {
    const match = content.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      data.amount = parseFloat(amountStr);
      break;
    }
  }

  return data;
}

// Parse custom JSON template and replace variables
function parseJsonTemplate(
  template: string,
  message: SmsMessage,
  matchedKeyword: string | null,
  extractedData: ReturnType<typeof extractSmsData>
): any {
  try {
    // Replace variables in template
    let jsonString = template
      .replace(/\{\{sender\}\}/g, JSON.stringify(message.sender))
      .replace(/\{\{content\}\}/g, JSON.stringify(message.content))
      .replace(/\{\{receivedAt\}\}/g, JSON.stringify(new Date(message.timestamp).toISOString()))
      .replace(/\{\{timestamp\}\}/g, message.timestamp.toString())
      .replace(/\{\{matchedKeyword\}\}/g, JSON.stringify(matchedKeyword || ''))
      .replace(/\{\{transactionId\}\}/g, JSON.stringify(extractedData.transactionId || ''))
      .replace(/\{\{referenceId\}\}/g, JSON.stringify(extractedData.referenceId || ''))
      .replace(/\{\{amount\}\}/g, extractedData.amount?.toString() || '0');

    // Support custom regex patterns: {{regex:pattern:group}}
    const regexPattern = /\{\{regex:([^:]+):(\d+)\}\}/g;
    let match;
    const regexMatches: Array<{ pattern: string; value: string }> = [];
    while ((match = regexPattern.exec(template)) !== null) {
      const pattern = match[1];
      const groupIndex = parseInt(match[2], 10);
      try {
        const regex = new RegExp(pattern, 'i');
        const contentMatch = message.content.match(regex);
        const value = contentMatch && contentMatch[groupIndex] ? contentMatch[groupIndex] : '';
        regexMatches.push({ pattern: match[0], value: JSON.stringify(value) });
      } catch (e) {
        regexMatches.push({ pattern: match[0], value: '""' });
      }
    }
    
    // Replace regex patterns
    regexMatches.forEach(({ pattern, value }) => {
      jsonString = jsonString.replace(pattern, value);
    });

    // Parse the JSON
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing custom JSON template:', error);
    throw new Error('Invalid JSON template format');
  }
}

// Forward SMS to API with retry logic
export async function forwardSms(message: SmsMessage, config: ForwarderConfig, matchedKeyword: string | null): Promise<boolean> {
  const logId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const maxRetries = config.retryAttempts || 0;
  const retryDelay = config.retryDelay || 1000;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (!config.apiEndpoint) {
        throw new Error('API endpoint not configured');
      }

      // Extract data from SMS content
      const extractedData = extractSmsData(message.content);

      // Build request body - use custom template if provided, otherwise use default
      let requestBody: any;
      if (config.customJsonTemplate && config.customJsonTemplate.trim()) {
        // Use custom JSON template
        requestBody = parseJsonTemplate(
          config.customJsonTemplate,
          message,
          matchedKeyword,
          extractedData
        );
      } else {
        // Use default JSON structure
        requestBody = {
          sender: message.sender,
          content: message.content,
          receivedAt: new Date(message.timestamp).toISOString(),
          referenceId: extractedData.referenceId,
          transactionId: extractedData.transactionId,
          amount: extractedData.amount,
          matchedKeyword,
        };
      }

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(config.customHeaders || {}),
      };

      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      // Read response body once (can only be read once)
      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      try {
        if (isJson) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          if (text) {
            try {
              responseData = JSON.parse(text);
            } catch {
              // Not JSON, that's okay
            }
          }
        }
      } catch (parseError) {
        // Failed to parse response, continue
      }

      if (!response.ok) {
        const errorText = responseData?.error || responseData?.message || `HTTP ${response.status}`;
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      // Check if response contains an error field even if status is OK
      if (responseData && responseData.error) {
        throw new Error(responseData.error);
      }

      // Success! Save successful forward log
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
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = lastError.message || 'Unknown error';
      
      // If this is not the last attempt, wait and retry
      if (attempt < maxRetries) {
        console.warn(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`, errorMessage);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1))); // Exponential backoff
        continue;
      }
      
      // Last attempt failed, log the error
      console.error('Error forwarding SMS after all retries:', errorMessage);

      // Save failed forward log with error details
      await saveForwardedLog({
        id: logId,
        sender: message.sender,
        content: message.content,
        receivedAt: new Date(message.timestamp).toISOString(),
        forwardedAt: new Date().toISOString(),
        success: false,
        matchedKeyword,
        errorMessage,
      });

      const stats = await getStats();
      await updateStats({
        errors: stats.errors + 1,
      });
      
      return false;
    }
  }
  
  // Should never reach here, but just in case
  return false;
}

// Process incoming SMS
export async function processSms(message: SmsMessage): Promise<void> {
  const config = await getConfig();
  const stats = await getStats();

  // Always update received count
  await updateStats({
    totalReceived: stats.totalReceived + 1,
  });

  const { shouldForward, matchedKeyword, reason } = shouldForwardSms(message, config);
  
  // Save to SMS logs
  const logId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  await saveSmsLog({
    id: logId,
    sender: message.sender,
    content: message.content,
    receivedAt: new Date(message.timestamp).toISOString(),
    forwarded: shouldForward,
  });

  if (shouldForward) {
    await forwardSms(message, config, matchedKeyword);
  } else if (reason) {
    console.log(`SMS not forwarded: ${reason}`);
  }
}
