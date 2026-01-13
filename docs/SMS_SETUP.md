# SMS Forwarder - Native SMS Reading Setup

This app requires native Android code to read incoming SMS messages. Since Expo's managed workflow doesn't support this out of the box, you'll need to create a development build.

## Prerequisites

- Expo CLI installed
- Android Studio installed
- Physical Android device or Android emulator

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

## Step 2: Create a Development Build

```bash
eas build:configure
eas build --profile development --platform android
```

## Step 3: Implement Native SMS Reading

You have two options:

### Option A: Using react-native-android-sms-listener (Recommended)

1. Install the package:
```bash
npm install react-native-android-sms-listener
```

2. Update `modules/sms-listener/index.ts` to use the native module:

```typescript
import SmsListener from 'react-native-android-sms-listener';

export function useSmsListener(callback: SmsListenerCallback) {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = SmsListener.addListener((message: any) => {
      const smsMessage: SmsMessage = {
        id: Date.now().toString(),
        sender: message.originatingAddress || message.address,
        content: message.body,
        timestamp: message.timestamp || Date.now(),
      };
      callback(smsMessage);
    });

    return () => subscription.remove();
  }, [callback]);
}
```

### Option B: Create a Custom Expo Module

1. Create a new expo module:
```bash
npx create-expo-module sms-reader
```

2. Implement Android SMS reading in the module following Expo's module API documentation.

## Step 4: Update AndroidManifest.xml

Add SMS permissions to your app.json:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "permissions": [
              "android.permission.RECEIVE_SMS",
              "android.permission.READ_SMS"
            ]
          }
        }
      ]
    ]
  }
}
```

## Step 5: Test the App

1. Install the development build on your Android device
2. Open the app
3. Grant SMS permissions when prompted
4. Configure the API endpoint in Settings
5. Enable monitoring in the Monitor tab
6. Test by sending a bKash payment or using the "Simulate Test SMS" button

## Step 6: Configure API Endpoint

The default API endpoint is:
```
https://your-supabase-url.supabase.co/functions/v1/sms/forward
```

You can find your Supabase URL in the `.env` file.

## Important Notes

1. **SMS Reading Only Works on Android**: iOS doesn't allow apps to read SMS messages for security reasons.

2. **Development Build Required**: You cannot test SMS reading in Expo Go. You must create a development build.

3. **Permissions**: Users must explicitly grant SMS permissions for the app to work.

4. **bKash Message Format**: The app is configured to detect common bKash SMS formats. If your format is different, you may need to update the parsing logic in `services/sms-forwarder.ts`.

5. **Testing**: Use the "Simulate Test SMS" button in the Monitor tab to test without actual SMS messages.

## API Integration

The app forwards SMS data to your configured endpoint with this payload:

```json
{
  "sender": "bKash",
  "content": "You have received BDT 500.00...",
  "receivedAt": "2024-01-01T12:00:00.000Z",
  "referenceId": "ABC123XYZ"
}
```

Your backend should respond with:

```json
{
  "success": true,
  "paymentId": "uuid",
  "message": "SMS forwarded successfully"
}
```

## Troubleshooting

### SMS Not Being Received

1. Check that SMS permissions are granted in device settings
2. Verify monitoring is enabled in the app
3. Check that the sender matches configured bKash senders
4. Verify filter keywords are configured correctly

### SMS Not Being Forwarded

1. Check the API endpoint configuration
2. Verify network connectivity
3. Check the SMS Logs tab for errors
4. Ensure the SMS matches the filter criteria

### Testing Without Real SMS

Use the "Simulate Test SMS" button in the Monitor tab to test the forwarding logic without real SMS messages.

## Production Deployment

When you're ready to deploy:

1. Build a production APK or AAB:
```bash
eas build --profile production --platform android
```

2. Submit to Google Play Store:
```bash
eas submit --platform android
```

## Security Considerations

1. **Never store sensitive data in the app**: All payment processing should happen on your backend.

2. **Use HTTPS**: Always use HTTPS for your API endpoint.

3. **Validate on backend**: Never trust client data. Always validate SMS content on your backend.

4. **Rate limiting**: Implement rate limiting on your API to prevent abuse.

5. **Authentication**: Consider adding authentication to your API endpoint.

## Support

For issues or questions:
- Check the Expo documentation: https://docs.expo.dev
- Check the React Native documentation: https://reactnative.dev
- Review Supabase documentation: https://supabase.com/docs
