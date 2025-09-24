# 📱 App Store Deployment Guide - Linguist Cub

**Growing together, word by word** 🐻

This guide will walk you through deploying Linguist Cub to both iOS App Store and Google Play Store.

## ✅ Completed Setup

- [x] **Production app.json configuration**
- [x] **EAS build configuration (eas.json)**
- [x] **Privacy Policy document**
- [x] **Terms of Service document**

## 🚀 Next Steps for Deployment

### Phase 1: Developer Account Setup (1-2 days)

#### 1. Apple Developer Program
1. **Sign up:** https://developer.apple.com/programs/
2. **Cost:** $99/year
3. **Requirements:**
   - Apple ID (use: lgoergen@gmail.com)
   - Credit card for payment
   - Business verification (may take 24-48 hours)

#### 2. Google Play Console
1. **Sign up:** https://play.google.com/console
2. **Cost:** $25 one-time fee
3. **Requirements:**
   - Google account (use: lgoergen@gmail.com)
   - Developer account verification

### Phase 2: App Assets Creation (2-3 days)

#### 1. App Icons Required
**iOS App Store:**
- 1024x1024 px (App Store)
- 180x180 px (iPhone)
- 152x152 px (iPad)

**Android Play Store:**
- 512x512 px (Play Store)
- Various sizes for different screen densities

#### 2. Screenshots Required
**iOS (6.5" iPhone):**
- 1284 x 2778 px (minimum 3 screenshots)
- 2778 x 1284 px (landscape if supported)

**Android (Pixel phones):**
- Various screen sizes
- Minimum 2 screenshots per supported device

#### 3. App Store Listing Content
- **Short description (80 chars):** "Track your child's multilingual language development journey milestone by milestone"
- **Full description:** Ready in APP_STORE_DETAILS.md
- **Keywords:** Pre-selected in app.json
- **Category:** Education/Family

### Phase 3: Technical Build Process (1 week)

#### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

#### 2. Configure Project ID
```bash
eas init --id your-project-id
```

#### 3. Build for Production
```bash
# iOS build
eas build --platform ios --profile production

# Android build
eas build --platform android --profile production
```

#### 4. Test Builds
- **iOS:** Use TestFlight for internal testing
- **Android:** Use Play Console internal testing track

### Phase 4: App Store Submission (1-2 weeks)

#### 1. iOS App Store Connect Setup
1. **Create App Record:**
   - Bundle ID: com.linguistcub.mobile
   - App Name: Linguist Cub
   - SKU: linguist-cub-mobile-v1
   - Primary Language: English

2. **App Information:**
   - Privacy Policy URL: [Your website]/privacy
   - Terms of Service URL: [Your website]/terms
   - Category: Education > Reference
   - Content Rating: 4+ (Educational, no objectionable content)

3. **Pricing:** Free (with optional premium features)

#### 2. Google Play Console Setup
1. **Create App:**
   - App name: Linguist Cub
   - Default language: English
   - App or game: App
   - Free or paid: Free

2. **Store Listing:**
   - Use prepared descriptions and screenshots
   - Content rating: Everyone (Educational content)
   - Target audience: Primary age group 0-2, Secondary 3-5

### Phase 5: Review and Launch (1-2 weeks)

#### iOS Review Process (7-10 days)
- **App Review Guidelines compliance**
- **Age-appropriate content verification**
- **Privacy policy review**
- **COPPA compliance check**

#### Android Review Process (3-7 days)
- **Policy compliance review**
- **Content rating verification**
- **Technical performance check**

## 🔧 Commands to Run Now

### 1. Update Project Configuration
```bash
# Update the EAS project ID in eas.json after getting approved for accounts
eas init --id YOUR_EXPO_PROJECT_ID

# Generate app signing credentials
eas credentials
```

### 2. Build Commands (after accounts are set up)
```bash
# Development builds for testing
eas build --platform all --profile preview

# Production builds for store submission
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 3. Submission Commands (after apps are approved)
```bash
# Submit to App Store (after Apple Developer setup)
eas submit --platform ios --profile production

# Submit to Google Play (after Play Console setup)
eas submit --platform android --profile production
```

## 📋 Checklist Before Submission

### Required Assets
- [ ] App icons (1024x1024 for both stores)
- [ ] Screenshots (iPhone 6.5", Android phones)
- [ ] App Store listing descriptions
- [ ] Privacy Policy hosted online
- [ ] Terms of Service hosted online

### Developer Accounts
- [ ] Apple Developer Program membership ($99)
- [ ] Google Play Console account ($25)
- [ ] App Store Connect access
- [ ] Google Play Console access

### App Configuration
- [x] Production app.json settings
- [x] EAS build configuration
- [x] Bundle identifiers set
- [x] App descriptions and metadata
- [ ] Final testing on physical devices
- [ ] Performance optimization

### Legal and Compliance
- [x] Privacy Policy created
- [x] Terms of Service created
- [ ] COPPA compliance review
- [ ] Content rating questionnaires
- [ ] Age rating documentation

## 🎯 Success Metrics to Track

### Pre-Launch
- Build success rate (target: 100%)
- TestFlight beta feedback
- Internal testing completion

### Post-Launch
- App Store approval time
- Download numbers
- User ratings and reviews
- Social media sharing usage

## 📞 Support and Resources

### Technical Issues
- **EAS Build docs:** https://docs.expo.dev/build/introduction/
- **App Store guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store policies:** https://play.google.com/about/developer-content-policy/

### Help Needed
If you encounter issues:
1. Check documentation links above
2. Search Expo forums for similar issues
3. Create support tickets with Apple/Google
4. Test on multiple devices before submission

## 🚀 Launch Timeline

**Total estimated time: 3-5 weeks**

- **Week 1:** Developer accounts, assets creation
- **Week 2:** EAS setup, production builds, testing
- **Week 3:** Store submissions, review process
- **Week 4-5:** Approval, launch, initial marketing

---

**🐻 Growing together, word by word - Let's get Linguist Cub into the hands of families who need it!**

*This guide will be updated as you progress through each phase. Good luck with your App Store journey!*