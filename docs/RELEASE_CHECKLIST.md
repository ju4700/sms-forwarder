# Play Store Release Checklist

Use this checklist before building and submitting your app to the Play Store.

## Pre-Build Checklist

### App Configuration
- [ ] Update `app.json`:
  - [ ] Change package name from `com.smsforwarder.app` to your unique package name
  - [ ] Update app name if needed
  - [ ] Set correct version (e.g., "1.0.0")
  - [ ] Set versionCode (start at 1)
  - [ ] Add EAS project ID (run `eas build:configure` first)
  - [ ] Add privacy policy URL in android section

### Assets
- [ ] App icon (1024x1024px PNG) at `./assets/images/icon.png`
- [ ] Splash screen configured
- [ ] Feature graphic (1024x500px) for Play Store
- [ ] Screenshots prepared (at least 2, 1080x1920px)

### Privacy & Legal
- [ ] Privacy policy created and hosted (REQUIRED for SMS apps)
- [ ] Privacy policy URL added to `app.json`
- [ ] Privacy policy explains:
  - [ ] Why SMS permissions are needed
  - [ ] How SMS data is used
  - [ ] How SMS data is stored/protected
  - [ ] User rights

### Code & Testing
- [ ] App tested thoroughly on real device
- [ ] SMS permissions work correctly
- [ ] SMS monitoring works correctly
- [ ] API forwarding works correctly
- [ ] All features tested
- [ ] No crashes or errors
- [ ] Error handling works properly

## Build Checklist

### Setup
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged into EAS: `eas login`
- [ ] EAS project configured: `eas build:configure`
- [ ] Dependencies installed: `npm install`
- [ ] `expo-build-properties` installed

### Build
- [ ] Run production build: `npm run build:android:production`
- [ ] Build completed successfully
- [ ] Downloaded `.aab` file
- [ ] Tested `.aab` file (convert to APK or use internal testing)

## Play Console Setup

### App Listing
- [ ] Created app in Play Console
- [ ] App name set
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Feature graphic uploaded
- [ ] Screenshots uploaded (at least 2)
- [ ] App category selected
- [ ] Content rating completed

### App Content
- [ ] Content rating questionnaire completed
- [ ] SMS permission declaration completed
- [ ] Privacy policy URL added
- [ ] Target audience specified

### Store Listing
- [ ] App description explains SMS functionality
- [ ] Screenshots show key features
- [ ] Feature graphic is attractive and informative
- [ ] Contact email/website added

## Submission Checklist

### Before Upload
- [ ] Google Service Account created
- [ ] Service Account JSON key downloaded
- [ ] JSON key saved as `google-service-account.json`
- [ ] Service Account granted access in Play Console

### Upload
- [ ] App bundle (.aab) uploaded
- [ ] Release notes written
- [ ] Release reviewed
- [ ] Submitted for review

### Post-Submission
- [ ] Monitor Play Console for review status
- [ ] Respond to any review feedback
- [ ] App approved and published

## Important Reminders

### Package Name
⚠️ **CRITICAL**: Change the package name in `app.json` before your first build!
- Current: `com.smsforwarder.app`
- Change to: `com.yourcompany.smsforwarder` (or similar)
- Package name cannot be changed after first release!

### Version Management
- `version`: User-facing version (e.g., "1.0.0")
- `versionCode`: Internal version, must increment with each release
- EAS can auto-increment `versionCode` (recommended)

### SMS Permission Requirements
Google Play requires:
1. Clear explanation of why SMS permissions are needed
2. Privacy policy explaining SMS data usage
3. Runtime permission requests (already implemented)
4. No spam or unauthorized access

### Common Issues
- **Missing Privacy Policy**: Most common rejection reason
- **Insufficient Permission Explanation**: Need detailed explanation
- **Package Name Conflicts**: Must be unique
- **Version Code Conflicts**: Must increment each release

## Quick Commands Reference

```bash
# Setup (first time)
npm install -g eas-cli
eas login
eas build:configure
npm install

# Build
npm run build:android:production

# Submit
npm run submit:android

# Check status
eas build:list
```

## Support Resources

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [SMS Permission Guidelines](https://support.google.com/googleplay/android-developer/answer/9888170)

---

**Ready to build? Start with: `npm run build:android:production`**
