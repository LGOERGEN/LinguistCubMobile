import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  StyleSheet,
  Linking,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { theme, shadows, gradients } from '../constants/theme';
import { dataService } from '../services/dataService';
import { generateHTMLReport } from '../components/ReportGenerator';

const SettingsScreen: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: true,
    hapticFeedback: true,
    darkMode: false,
  });

  const handleExportData = async () => {
    try {
      setIsExporting(true);

      const appData = await dataService.getAllData();
      const exportData = {
        ...appData,
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      await Share.share({
        message: jsonString,
        title: 'Export Linguist Cub Data',
      });

      Alert.alert('Export Successful', 'Your data has been exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);

      const activeChild = dataService.getActiveChild();

      if (!activeChild) {
        Alert.alert('No Child Selected', 'Please select or create a child profile first.');
        return;
      }

      // Generate HTML report
      const htmlContent = generateHTMLReport(activeChild);

      // Convert HTML to PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${activeChild.name}'s Language Development Report`,
          UTI: 'public.pdf',
        });
      } else {
        Alert.alert('Sharing not available', 'PDF generated but sharing is not available on this device.');
      }

      Alert.alert('Export Successful', 'Language development report PDF has been generated and shared!');
    } catch (error) {
      console.error('Export report error:', error);
      Alert.alert('Export Failed', 'Failed to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsImporting(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];

        Alert.alert(
          'Import Data',
          'This will replace all existing data. Are you sure you want to continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Import',
              style: 'destructive',
              onPress: () => processImportFile(file.uri),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Failed to select import file. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const processImportFile = async (fileUri: string) => {
    try {
      // For now, show a coming soon message
      Alert.alert('Import', 'File import functionality will be available in a future update.');
    } catch (error) {
      Alert.alert('Import Failed', 'Failed to import data. Please check the file format.');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all children profiles and word progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await dataService.clearAllData();
              Alert.alert('Data Cleared', 'All data has been permanently deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    const email = 'support@linguistcub.com';
    const subject = 'Linguist Cub Support Request';
    const body = 'Please describe your issue or question:';

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(mailtoUrl).then((supported) => {
      if (supported) {
        Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Email Not Available', 'Please contact us at support@linguistcub.com');
      }
    });
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderPreferenceItem = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    icon: string
  ) => {
    return (
      <LinearGradient
        colors={value ? gradients.primaryCard : gradients.card}
        style={styles.preferenceItem}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.preferenceContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.preferenceIcon}>{icon}</Text>
          </View>
          <View style={styles.preferenceTextContainer}>
            <Text style={[styles.preferenceTitle, value && styles.activePreferenceTitle]}>{title}</Text>
            <Text style={[styles.preferenceDescription, value && styles.activePreferenceDescription]}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: 'rgba(96, 125, 139, 0.3)', true: theme.colors.secondary }}
          thumbColor={value ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="rgba(96, 125, 139, 0.3)"
        />
      </LinearGradient>
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    onPress: () => void,
    icon: string,
    loading?: boolean,
    variant?: 'default' | 'danger'
  ) => {
    const isDisabled = loading;
    const gradientColors = variant === 'danger' ?
      ['rgba(255, 122, 133, 0.1)', 'rgba(255, 122, 133, 0.05)'] :
      gradients.card;

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[isDisabled && styles.disabledButton]}
      >
        <LinearGradient
          colors={gradientColors}
          style={[styles.settingButton, variant === 'danger' && styles.dangerButton]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.settingContent}>
            <View style={[styles.iconContainer, variant === 'danger' && styles.dangerIconContainer]}>
              <Text style={styles.settingIcon}>{icon}</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, variant === 'danger' && styles.dangerText]}>
                {title}
              </Text>
              <Text style={[styles.settingDescription, variant === 'danger' && styles.dangerDescription]}>{description}</Text>
            </View>
            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>•••</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={gradients.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your app preferences and data</Text>
        </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        {renderSettingItem(
          'Export Data',
          'Create a backup file of all your children\'s data',
          handleExportData,
          '📤',
          isExporting
        )}

        {renderSettingItem(
          'Import Data',
          'Restore data from a backup file',
          handleImportData,
          '📥',
          isImporting
        )}

        {renderSettingItem(
          'Clear All Data',
          'Permanently delete all children profiles and progress',
          handleClearAllData,
          '',
          false,
          'danger'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>

        {renderPreferenceItem(
          'Notifications',
          'Receive milestone and progress notifications',
          preferences.notifications,
          () => togglePreference('notifications'),
          '🔔'
        )}

        {renderPreferenceItem(
          'Haptic Feedback',
          'Feel vibrations when interacting with the app',
          preferences.hapticFeedback,
          () => togglePreference('hapticFeedback'),
          '📳'
        )}

        {renderPreferenceItem(
          'Dark Mode',
          'Use dark theme (coming soon)',
          preferences.darkMode,
          () => togglePreference('darkMode'),
          '🌙'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        {renderSettingItem(
          'Contact Support',
          'Get help or send feedback',
          handleContactSupport,
          '💬'
        )}
      </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <LinearGradient
            colors={gradients.primaryCard}
            style={styles.aboutCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.appName}>LINGUIST CUB</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Track your child's language development in multiple languages.
              Monitor vocabulary growth, understanding, and speaking progress across different categories.
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with love for language learning families
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...shadows.md,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  section: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingButton: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...shadows.md,
  },
  dangerButton: {
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  disabledButton: {
    opacity: 0.6,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(158, 183, 221, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(255, 122, 133, 0.2)',
  },
  settingIcon: {
    fontSize: theme.fontSizes.lg,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  dangerDescription: {
    color: 'rgba(255, 122, 133, 0.8)',
  },
  settingButtonText: {
    color: theme.colors.text,
  },
  dangerButtonText: {
    color: theme.colors.error,
  },
  dangerText: {
    color: theme.colors.error,
  },
  loadingContainer: {
    marginLeft: 'auto',
    paddingHorizontal: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  aboutCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...shadows.lg,
  },
  appName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: theme.spacing.sm,
    letterSpacing: 2,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: theme.fontSizes.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: theme.fontSizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Preference styles
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...shadows.md,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    fontSize: theme.fontSizes.lg,
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  activePreferenceTitle: {
    color: '#ffffff',
  },
  preferenceDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  activePreferenceDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default SettingsScreen;