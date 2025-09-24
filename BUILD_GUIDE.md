# Linguist Cub - Production Build Guide

## Phase 3A Complete! ✅

You have successfully completed the App Store preparation phase. Your app is now configured for production deployment.

### What We Accomplished:
- ✅ Replaced default assets with branded Linguist Cub logo
- ✅ Updated app.json with production configuration
- ✅ Created EAS Build configuration (eas.json)
- ✅ Installed and configured EAS CLI
- ✅ Prepared comprehensive App Store metadata

## Next Steps for App Store Submission

### Phase 3B: Apple Developer Setup (Required)
1. **Create Apple Developer Account** ($99/year)
   - Go to https://developer.apple.com/programs/
   - Enroll in the Apple Developer Program
   - Verify your identity (may take 24-48 hours)

2. **Set up App Store Connect**
   - Log into https://appstoreconnect.apple.com
   - Create a new app with bundle ID: `com.linguistcub.mobile`
   - Fill in basic app information

### Phase 3C: Build Generation
3. **Generate Production Build**
   ```bash
   cd /Users/lgoergen/Documents/Repositories/LinguistCubMobile

   # Login to Expo account (if not already logged in)
   eas login

   # Build for iOS App Store
   eas build --platform ios --profile production
   ```

4. **Generate Screenshots** (Use iOS Simulator)
   - Open app in iOS Simulator (iPhone 14 Pro Max for 6.7" screenshots)
   - Take screenshots of key screens:
     - Home screen with child profiles
     - Category selection screen
     - Word tracking interface
     - Statistics/milestone screen
     - Settings screen
   - Screenshots should be 1290x2796 pixels (6.7" display)

### Phase 3D: App Store Connect Setup
5. **Upload Build to App Store Connect**
   - EAS will automatically upload your build
   - Or use Transporter app from Mac App Store
   - Build will appear in App Store Connect after processing (10-60 minutes)

6. **Complete App Store Listing**
   - Add app description (from APP_STORE_METADATA.md)
   - Upload screenshots
   - Set category: Education
   - Set age rating: 4+
   - Add keywords
   - Set pricing (Free recommended for initial launch)

### Phase 3E: Submission
7. **Submit for Review**
   - Review all information
   - Submit for App Store review
   - Typical review time: 24-48 hours
   - Address any feedback from Apple if rejected

## Quick Commands Reference

```bash
# Check build status
eas build:list

# Build for iOS
eas build --platform ios --profile production

# Generate screenshots using simulator
xcrun simctl boot "iPhone 14 Pro Max"
npx expo run:ios --configuration Release

# Check app configuration
npx expo doctor
```

## Troubleshooting

### Common Issues:
- **Build fails**: Check that all dependencies are compatible
- **Asset issues**: Ensure icon.png is exactly 1024x1024 pixels
- **Bundle ID conflicts**: Verify com.linguistcub.mobile is unique in App Store Connect

### Support Resources:
- EAS Build docs: https://docs.expo.dev/build/introduction/
- App Store Connect Guide: https://developer.apple.com/app-store-connect/
- iOS Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

## Current App Status
🎉 **Ready for Apple Developer Account setup and build generation!**

Your Linguist Cub app is fully configured and ready for the App Store submission process. The next steps require an Apple Developer account to proceed with building and uploading to App Store Connect.

---
*Generated during Phase 3A completion*