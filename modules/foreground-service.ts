import { NativeModules, Platform } from 'react-native';

const { SmsForegroundModule } = NativeModules;

export function startForegroundService(totalForwarded: number, messages: string[]) {
  if (Platform.OS !== 'android' || !SmsForegroundModule) {
    return;
  }
  SmsForegroundModule.startService(totalForwarded, messages);
}

export function updateForegroundNotification(totalForwarded: number, messages: string[]) {
  if (Platform.OS !== 'android' || !SmsForegroundModule) {
    return;
  }
  SmsForegroundModule.updateNotification(totalForwarded, messages);
}

export function stopForegroundService() {
  if (Platform.OS !== 'android' || !SmsForegroundModule) {
    return;
  }
  SmsForegroundModule.stopService();
}
