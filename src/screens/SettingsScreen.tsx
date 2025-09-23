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
import * as DocumentPicker from 'expo-document-picker';

import { theme, shadows } from '../constants/theme';
import { dataService } from '../services/dataService';

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
      <View style={styles.preferenceItem}>
        <View style={styles.preferenceContent}>
          <Text style={styles.preferenceIcon}>{icon}</Text>
          <View style={styles.preferenceTextContainer}>
            <Text style={styles.preferenceTitle}>{title}</Text>
            <Text style={styles.preferenceDescription}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: theme.colors.primary }}
          thumbColor={value ? '#ffffff' : '#f4f3f4'}
        />
      </View>
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
    const buttonStyle = variant === 'danger' ? styles.dangerButton : styles.settingButton;
    const textStyle = variant === 'danger' ? styles.dangerButtonText : styles.settingButtonText;

    return (
      <TouchableOpacity
        style={[buttonStyle, isDisabled && styles.disabledButton]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <View style={styles.settingContent}>
          <Text style={styles.settingIcon}>{icon}</Text>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, variant === 'danger' && styles.dangerText]}>
              {title}
            </Text>
            <Text style={styles.settingDescription}>{description}</Text>
          </View>
        </View>
        {loading && <Text style={styles.loadingText}>Loading...</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences and data</Text>
      </View>

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

        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Linguist Cub</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Track your child's language development in English and Portuguese.
            Monitor vocabulary growth, understanding, and speaking progress across different categories.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with love for language learning families
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...shadows.sm,
  },
  dangerButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.error,
    ...shadows.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: theme.fontSizes.xl,
    marginRight: theme.spacing.md,
    width: 30,
    textAlign: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
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
  loadingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  aboutCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...shadows.sm,
  },
  appName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  appVersion: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  appDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    lineHeight: 22,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...shadows.sm,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    fontSize: theme.fontSizes.lg,
    marginRight: theme.spacing.md,
    width: 24,
    textAlign: 'center',
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});

export default SettingsScreen;