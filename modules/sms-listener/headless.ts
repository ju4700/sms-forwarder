import { processSms } from '@/services/sms-forwarder';
import { SmsMessage } from './index';

export async function smsForwardTask(rawMessage: Partial<SmsMessage>) {
  if (!rawMessage) {
    return;
  }

  const message: SmsMessage = {
    id: rawMessage.id || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    sender: rawMessage.sender || 'Unknown',
    content: rawMessage.content || '',
    timestamp: rawMessage.timestamp || Date.now(),
  };

  await processSms(message);
}
