import 'expo-router/entry';
import { AppRegistry } from 'react-native';
import { smsForwardTask } from './modules/sms-listener/headless';

AppRegistry.registerHeadlessTask('SmsForwardTask', () => smsForwardTask);
