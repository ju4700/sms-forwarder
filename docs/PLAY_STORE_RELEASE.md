# Play Store Release Guide

This guide will help you build and submit your SMS Forwarder app to the Google Play Store.

## Prerequisites

1. **EAS CLI** - Install globally:
   ```bash
   npm install -g eas-cli
   ```

2. **Expo Account** - Sign up at https://expo.dev if you don't have one

3. **Google Play Console Account** - Required for app submission
   - Create account at https://play.google.com/console
   - Pay the one-time $25 registration fee

4. **App Signing Key** - EAS will handle this automatically, but you can also provide your own

## Step 1: Install Dependencies

```bash
npm install
```

Make sure `expo-build-properties` is installed:
```bash
npm install expo-build-properties --save-dev
```

## Step 2: Configure EAS Project

1. Login to EAS:
   ```bash
   eas login
   ```

2. Initialize EAS project (if not already done):
   ```bash
   eas build:configure
   ```

3. Update `app.json` with your EAS project ID:
   - After running `eas build:configure`, you'll get a project ID
   - Update the `extra.eas.projectId` field in `app.json`

## Step 3: Update App Configuration

### Update app.json

Before building, make sure to update these fields in `app.json`:

1. **Package Name**: Change `com.smsforwarder.app` to your unique package name (e.g., `com.yourcompany.smsforwarder`)
2. **App Name**: Update `"name"` field to your desired app name
3. **Version**: Update `version` and `versionCode` as needed
4. **Icon**: Ensure you have a proper app icon (1024x1024px PNG)
5. **Privacy Policy URL**: Add your privacy policy URL (required for SMS permissions)

### Add Privacy Policy

Google Play requires a privacy policy for apps that request sensitive permissions like SMS. Add this to your `app.json`:

```json
"android": {
  "privacyPolicyUrl": "https://yourwebsite.com/privacy-policy"
}
```

## Step 4: Prepare App Assets

### App Icon
- Size: 1024x1024px
- Format: PNG
- Location: `./assets/images/icon.png`
- Must be square and high quality

### Feature Graphic (for Play Store listing)
- Size: 1024x500px
- Format: PNG
- Will be uploaded separately in Play Console

### Screenshots
Prepare screenshots for Play Store:
- Phone: At least 2 screenshots (1080x1920px or similar)
- Tablet (optional): At least 2 screenshots

## Step 5: Build Production APK/AAB

### Option A: Build App Bundle (Recommended for Play Store)

```bash
npm run build:android:production
```

Or directly:
```bash
eas build --platform android --profile production
```

This will:
- Build an Android App Bundle (.aab) - required for Play Store
- Automatically increment version code
- Sign the app with EAS-managed credentials

### Option B: Build APK (For Testing)

```bash
npm run build:android:preview
```

Or:
```bash
eas build --platform android --profile preview
```

## Step 6: Download and Test

1. After the build completes, download the build from:
   - EAS Dashboard: https://expo.dev/accounts/[your-account]/projects/[your-project]/builds
   - Or use the link provided in the terminal

2. Install on a test device:
   ```bash
   adb install path/to/your-app.apk
   ```

3. Test thoroughly:
   - SMS permissions request
   - SMS monitoring functionality
   - API forwarding
   - All app features

## Step 7: Set Up Google Play Console

1. **Create App Listing**:
   - Go to https://play.google.com/console
   - Click "Create app"
   - Fill in app details:
     - App name: "SMS Forwarder" (or your name)
     - Default language: English
     - App or game: App
     - Free or paid: Free

2. **Complete Store Listing**:
   - App description (short and full)
   - Screenshots
   - Feature graphic
   - Privacy policy URL (required!)
   - App category
   - Content rating questionnaire

3. **Set Up App Content**:
   - Complete content rating questionnaire
   - Answer SMS permission questions:
     - Why does your app need SMS permissions?
     - How does your app use SMS data?
     - Provide detailed explanation

## Step 8: Upload App Bundle

### Option A: Using EAS Submit (Recommended)

1. **Set up Google Service Account**:
   - Go to Google Play Console → Setup → API access
   - Create a service account
   - Download the JSON key file
   - Save it as `google-service-account.json` in project root
   - Grant the service account access in Play Console

2. **Submit to Play Store**:
   ```bash
   npm run submit:android
   ```
   
   Or:
   ```bash
   eas submit --platform android
   ```

### Option B: Manual Upload

1. Download the `.aab` file from EAS dashboard
2. Go to Play Console → Production → Create new release
3. Upload the `.aab` file
4. Add release notes
5. Review and roll out

## Step 9: Complete Play Store Requirements

### Required Information:

1. **Privacy Policy** (MANDATORY for SMS apps):
   - Must be publicly accessible URL
   - Must explain:
     - Why you collect SMS data
     - How you use SMS data
     - How you store/protect SMS data
     - User rights regarding their data

2. **SMS Permission Declaration**:
   - Explain why your app needs SMS permissions
   - Describe how SMS data is used
   - Confirm data is not shared with third parties (if applicable)

3. **Content Rating**:
   - Complete the questionnaire
   - SMS apps typically get "Everyone" rating

4. **Target Audience**:
   - Specify age groups
   - SMS apps are typically 18+

## Step 10: Review and Publish

1. **Review Checklist**:
   - [ ] App bundle uploaded
   - [ ] Store listing complete
   - [ ] Privacy policy added
   - [ ] SMS permission declaration completed
   - [ ] Content rating completed
   - [ ] App tested thoroughly
   - [ ] Release notes written

2. **Submit for Review**:
   - Click "Review release" in Play Console
   - Google will review your app (usually 1-3 days)
   - You'll receive email notifications about status

3. **After Approval**:
   - App will be published automatically
   - Or you can manually publish from Play Console

## Important Notes for SMS Apps

### Google Play Policies:

1. **SMS Permissions**:
   - Must have clear, legitimate use case
   - Must explain in app description and privacy policy
   - Cannot be used for spam or unauthorized access

2. **Privacy Policy Requirements**:
   - Must be accessible before app installation
   - Must explain SMS data collection and usage
   - Must comply with GDPR and other privacy laws

3. **User Consent**:
   - App must request permissions at runtime
   - Must explain why permissions are needed
   - Users must be able to deny permissions

4. **Data Security**:
   - SMS data must be encrypted in transit
   - Must not store SMS data unnecessarily
   - Must comply with data protection laws

### Common Rejection Reasons:

1. **Missing Privacy Policy** - Most common rejection
2. **Insufficient SMS Permission Explanation** - Need detailed explanation
3. **Poor App Description** - Must clearly explain app purpose
4. **Missing Content Rating** - Must complete questionnaire
5. **App Crashes** - Must test thoroughly before submission

## Troubleshooting

### Build Issues:

1. **Build Fails**:
   ```bash
   eas build --platform android --profile production --clear-cache
   ```

2. **Version Code Conflicts**:
   - Update `versionCode` in `app.json`
   - Or let EAS auto-increment (recommended)

3. **Signing Issues**:
   - EAS handles signing automatically
   - If using custom key, ensure it's properly configured

### Submission Issues:

1. **Service Account Errors**:
   - Verify JSON key file is correct
   - Check service account has proper permissions
   - Ensure API access is enabled in Play Console

2. **Upload Errors**:
   - Verify `.aab` file is valid
   - Check version code is higher than previous
   - Ensure all required fields are filled

## Version Updates

For future updates:

1. Update version in `app.json`:
   ```json
   "version": "1.0.1",
   "versionCode": 2
   ```

2. Build new version:
   ```bash
   npm run build:android:production
   ```

3. Submit update:
   ```bash
   npm run submit:android
   ```

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Google Play Console](https://play.google.com/console)
- [Play Store Policy](https://play.google.com/about/developer-content-policy/)
- [SMS Permission Guidelines](https://support.google.com/googleplay/android-developer/answer/9888170)

## Support

If you encounter issues:
1. Check EAS build logs: https://expo.dev/accounts/[account]/projects/[project]/builds
2. Check Play Console for submission errors
3. Review Expo documentation
4. Check Google Play Developer support

---

**Good luck with your Play Store release! 🚀**
