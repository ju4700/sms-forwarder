# bKash SMS Forwarder

An Android app that automatically monitors incoming bKash SMS messages and forwards them to a web application for payment verification and status updates.

## Features

- 📱 **Automatic SMS Monitoring**: Listens for incoming bKash SMS messages in real-time
- 🔄 **Automatic Forwarding**: Sends payment information to your configured API endpoint
- 💳 **Payment Tracking**: View all forwarded payments with status tracking
- 📊 **SMS Logs**: Complete history of all SMS messages received
- ⚙️ **Configurable Filters**: Customize which SMS messages to forward
- 🧪 **Test Mode**: Simulate SMS messages for testing without real transactions
- 🔒 **Secure**: All data is encrypted and permissions are properly managed

## Screenshots

### Monitor Tab
Real-time monitoring status, statistics, and control panel

### Payments Tab
View all forwarded payments with their current status

### SMS Logs Tab
Complete history of all SMS messages processed by the app

### Settings Tab
Configure API endpoint, filters, and app preferences

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Expo CLI
- Android device or emulator (iOS not supported for SMS reading)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sms-forwarder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```bash
npm run dev
```

### Building for Android

For SMS reading functionality, you need to create a development build:

```bash
eas build --profile development --platform android
```

See [SMS_SETUP.md](./SMS_SETUP.md) for detailed instructions.

## Usage

### Initial Setup

1. **Grant Permissions**: When you first open the app, grant SMS permissions
2. **Configure API**: Go to Settings and set your API endpoint
3. **Configure Filters**: Add bKash sender names and filter keywords
4. **Enable Monitoring**: Go to Monitor tab and tap "Start Monitoring"

### API Endpoint

The app sends POST requests to your configured endpoint with this structure:

```json
{
  "sender": "bKash",
  "content": "Full SMS message text",
  "receivedAt": "2024-01-01T12:00:00.000Z",
  "referenceId": "ABC123XYZ"
}
```

Your API should respond with:

```json
{
  "success": true,
  "paymentId": "uuid",
  "message": "SMS forwarded successfully"
}
```

### Database Schema

The app uses Supabase with the following tables:

#### payments
- `id` (uuid): Unique payment identifier
- `reference_id` (text): bKash transaction reference
- `amount` (decimal): Payment amount
- `sender` (text): Sender phone number
- `status` (text): Payment status (pending, received, verified)
- `sms_content` (text): Full SMS message
- `created_at` (timestamp): Creation time
- `updated_at` (timestamp): Last update time

#### sms_logs
- `id` (uuid): Unique log identifier
- `sender` (text): SMS sender
- `content` (text): SMS content
- `received_at` (timestamp): When SMS was received
- `payment_id` (uuid): Linked payment ID
- `forwarded` (boolean): Whether SMS was forwarded
- `created_at` (timestamp): Log creation time

## Configuration

### Filter Keywords

Add keywords that should be present in SMS messages for them to be forwarded. Default keywords:
- bkash
- trxid
- transaction

### bKash Senders

Add sender names/numbers that the app should monitor. Default senders:
- bKash
- 16247
- bKash-Pay

## Testing

Use the "Simulate Test SMS" button in the Monitor tab to test the app without receiving actual SMS messages. This sends a mock bKash payment SMS through the system.

## Architecture

### Frontend (React Native + Expo)
- **Expo Router**: File-based routing with tabs
- **React Native**: UI components and native functionality
- **AsyncStorage**: Local configuration storage
- **Supabase Client**: Database queries and real-time updates

### Backend (Supabase)
- **PostgreSQL**: Payment and log storage
- **Row Level Security**: Secure data access
- **API Routes**: Expo Router API endpoints

### SMS Processing Flow

1. Android receives SMS message
2. SMS listener captures the message
3. App checks if sender and content match filters
4. App extracts payment information (reference ID, amount, sender)
5. App forwards data to configured API endpoint
6. API stores payment in database
7. App logs the SMS in local database

## Security

- SMS permissions are required and must be granted by user
- All API communication uses HTTPS
- Database access is protected with Row Level Security
- No sensitive data is stored locally
- All payment processing happens on the backend

## Limitations

- **Android Only**: iOS doesn't allow apps to read SMS messages
- **Development Build Required**: Cannot run in Expo Go
- **Permissions Required**: User must grant SMS permissions
- **Network Required**: Must have internet connection to forward SMS

## Troubleshooting

### SMS Not Being Detected

1. Check SMS permissions are granted
2. Verify monitoring is enabled
3. Check sender is in configured list
4. Verify SMS contains filter keywords

### SMS Not Being Forwarded

1. Check API endpoint is configured correctly
2. Verify internet connection
3. Check SMS Logs tab for error details
4. Test API endpoint manually

### App Crashes on SMS Receipt

1. Check device logs: `adb logcat`
2. Verify native module is properly installed
3. Rebuild the app: `eas build`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For help and support:
- Open an issue on GitHub
- Check [SMS_SETUP.md](./SMS_SETUP.md) for setup instructions
- Review Expo documentation: https://docs.expo.dev

## Acknowledgments

- Built with Expo and React Native
- Database powered by Supabase
- Icons from Lucide React Native
