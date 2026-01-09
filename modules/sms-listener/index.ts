import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type SmsMessage = {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
};

export type SmsListenerCallback = (message: SmsMessage) => void;

let listeners: SmsListenerCallback[] = [];

export function useSmsListener(callback: SmsListenerCallback) {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      console.warn('SMS listening is only supported on Android');
      return;
    }

    listeners.push(callback);

    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  }, [callback]);
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
