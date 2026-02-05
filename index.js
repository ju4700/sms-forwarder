import 'expo-router/entry';
import { AppRegistry } from 'react-native';
import { smsForwardTask } from './modules/sms-listener/headless';
import { smsBootTask } from './modules/sms-listener/boot-headless';

AppRegistry.registerHeadlessTask('SmsForwardTask', () => smsForwardTask);
AppRegistry.registerHeadlessTask('SmsBootTask', () => smsBootTask);
