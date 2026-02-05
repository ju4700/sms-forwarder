import { getConfig, getForwardedLogs, getStats } from '@/services/sms-forwarder';
import { startForegroundService } from '@/modules/foreground-service';

export async function smsBootTask() {
  const config = await getConfig();
  if (!config.enabled) {
    return;
  }

  const [stats, forwardedLogs] = await Promise.all([
    getStats(),
    getForwardedLogs(),
  ]);

  const recentMessages = forwardedLogs
    .filter(log => log.success)
    .slice(0, 5)
    .map(log => `${log.sender}: ${log.content.replace(/\s+/g, ' ').trim().slice(0, 60)}`);

  startForegroundService(stats.totalForwarded, recentMessages);
}
