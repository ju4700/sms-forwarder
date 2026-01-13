# Quick Build Commands

## Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS project (first time only)
eas build:configure
```

## Build Commands

### Development Build (for testing)
```bash
eas build --platform android --profile development
```

### Preview Build (APK for testing)
```bash
npm run build:android:preview
# or
eas build --platform android --profile preview
```

### Production Build (AAB for Play Store)
```bash
npm run build:android:production
# or
eas build --platform android --profile production
```

## Submit to Play Store

### First Time Setup
1. Create Google Service Account in Play Console
2. Download JSON key file
3. Save as `google-service-account.json` in project root

### Submit Command
```bash
npm run submit:android
# or
eas submit --platform android
```

## Check Build Status

View builds at: https://expo.dev/accounts/[your-account]/projects/[your-project]/builds

Or use:
```bash
eas build:list
```

## Common Issues

### Clear Cache
```bash
eas build --platform android --profile production --clear-cache
```

### Update Version
Edit `app.json`:
- `version`: "1.0.1" (user-facing version)
- `versionCode`: 2 (internal version, must increment)

### Check Build Logs
```bash
eas build:view [build-id]
```
