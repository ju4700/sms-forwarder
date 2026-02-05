# GitHub Release (APK)

This guide explains how to build and publish an installable Android APK through GitHub Releases (outside the Play Store).

## Recommended: GitHub Actions (CI)

The workflow in [ .github/workflows/build-android-apk.yml ](.github/workflows/build-android-apk.yml) builds an APK using EAS and attaches it to a GitHub Release when you push a tag.

### 1) Add GitHub Secret

Create a repository secret named `EXPO_TOKEN` with a valid Expo token:

1. Go to https://expo.dev/accounts and generate a token
2. In GitHub → Settings → Secrets and variables → Actions
3. Add `EXPO_TOKEN`

### 2) Create a Tag

Create and push a tag like `v1.0.1`:

- The workflow will run automatically
- The APK will be attached to the GitHub Release for that tag

### 3) Manual Trigger (Optional)

You can also run the workflow from the Actions tab and choose a build profile (default: `preview`).

## Manual Build (Local)

If you prefer to build locally and upload manually:

1. Install dependencies
   - `npm install`

2. Login to EAS
   - `eas login`

3. Build an APK (preview profile)
   - `npm run build:android:preview`

4. Download the APK from the EAS dashboard and upload it to your GitHub Release.

## Versioning Notes

- Update `expo.version` in [app.json](app.json)
- Bump `android.versionCode` in [app.json](app.json)
- Keep `package.json` version aligned if you use it for release notes

## Troubleshooting

- If EAS build fails in CI, verify `EXPO_TOKEN` and that the EAS project is configured.
- For SMS permissions, Play Store policies don’t apply to GitHub distribution, but users must still grant permissions at runtime.