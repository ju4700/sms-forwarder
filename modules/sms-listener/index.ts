import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export type SmsMessage = {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
};

export type SmsListenerCallback = (message: SmsMessage) => void;

let listeners: SmsListenerCallback[] = [];
let smsCheckInterval: NodeJS.Timeout | null = null;

// Try to use native SMS listener if available
let SmsListener: any = null;
try {
  // Try to load react-native-android-sms-listener if installed
  SmsListener = require('react-native-android-sms-listener');
} catch {
  // Library not installed, will use fallback method
  SmsListener = null;
}

export function useSmsListener(callback: SmsListenerCallback) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      console.warn('SMS listening is only supported on Android');
      return;
    }

    const wrappedCallback = (message: SmsMessage) => {
      callbackRef.current(message);
    };

    listeners.push(wrappedCallback);

    // If native SMS listener is available, use it
    let subscription: any = null;
    if (SmsListener) {
      try {
        console.log('Initializing native SMS listener...');
        subscription = SmsListener.addListener((message: any) => {
          console.log('Native SMS received:', message);
          const smsMessage: SmsMessage = {
            id: `${message.timestamp || Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            sender: message.originatingAddress || message.address || 'Unknown',
            content: message.body || '',
            timestamp: message.timestamp || Date.now(),
          };
          
          // Notify all listeners
          listeners.forEach(cb => cb(smsMessage));
        });
      } catch (error) {
        console.warn('Error setting up native SMS listener:', error);
      }
    } else {
      // Fallback: Without native SMS listener library, only simulated messages will work
      console.warn('Native SMS listener not available. Falling back to simulation mode.');
    }

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        try {
          subscription.remove();
        } catch (error) {
          console.warn('Error removing SMS listener subscription:', error);
        }
      }
      listeners = listeners.filter(cb => cb !== wrappedCallback);
    };
  }, []);
}

export async function requestSmsPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    // This is a placeholder - you'll need to implement this with native code
    // Using expo-modules-core or react-native's PermissionsAndroid
    const { PermissionsAndroid } = require('react-native');

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      {
        title: 'SMS Permission',
        message: 'This app needs access to read SMS messages to forward bKash payment notifications.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    const readGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Read Permission',
        message: 'This app needs access to read SMS messages.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED &&
           readGranted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Error requesting SMS permissions:', err);
    return false;
  }
}

export function checkSmsPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return Promise.resolve(false);
  }

  try {
    const { PermissionsAndroid } = require('react-native');
    return Promise.all([
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS),
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS),
    ]).then(([receive, read]) => receive && read);
  } catch {
    return Promise.resolve(false);
  }
}

// Simulate receiving an SMS (for testing purposes)
export function simulateIncomingSms(sender: string, content: string) {
  const message: SmsMessage = {
    id: Date.now().toString(),
    sender,
    content,
    timestamp: Date.now(),
  };

  listeners.forEach(callback => callback(message));
}
