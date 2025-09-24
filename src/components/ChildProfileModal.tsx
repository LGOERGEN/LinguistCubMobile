import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { theme, shadows } from '../constants/theme';
import { Child } from '../types';

interface ChildProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, birthDate: string | null, languages: ('english' | 'portuguese' | 'spanish')[]) => void;
  onDelete?: () => void;
  child?: Child | null;
  mode: 'create' | 'edit';
}

const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  child,
  mode,
}) => {
  const [name, setName] = useState(child?.name || '');
  const [birthDate, setBirthDate] = useState<Date | null>(
    child?.birthDate ? new Date(child.birthDate) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<('english' | 'portuguese' | 'spanish')[]>(
    child?.selectedLanguages || ['english', 'portuguese']
  );

  // Update state when child prop changes (for edit mode)
  useEffect(() => {
    if (visible) {
      setName(child?.name || '');
      setBirthDate(child?.birthDate ? new Date(child.birthDate) : null);
      setSelectedLanguages(child?.selectedLanguages || ['english', 'portuguese']);
    }
  }, [visible, child]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required Field Missing', 'Please enter a child name');
      return;
    }

    if (!birthDate) {
      Alert.alert('Required Field Missing', 'Please select a birth date');
      return;
    }

    if (selectedLanguages.length === 0) {
      Alert.alert('Required Field Missing', 'Please select at least one language to track');
      return;
    }

    const birthDateString = birthDate.toISOString();
    onSave(name.trim(), birthDateString, selectedLanguages);
    handleClose();
  };

  const handleClose = () => {
    setName(child?.name || '');
    setBirthDate(child?.birthDate ? new Date(child.birthDate) : null);
    setSelectedLanguages(child?.selectedLanguages || ['english', 'portuguese']);
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const toggleLanguage = (language: 'english' | 'portuguese' | 'spanish') => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(lang => lang !== language);
      } else {
        return [...prev, language];
      }
    });
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not set';
    return date.toLocaleDateString();
  };

  const calculateAge = (birthDate: Date | null): string => {
    if (!birthDate) return '';

    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 +
                       (today.getMonth() - birth.getMonth());

    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    if (years > 0) {
      return ` (${years}y ${months}m)`;
    }
    return ` (${months} months)`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'create' ? 'Add New Child' : `Edit ${child?.name}`}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter child's name"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus={mode === 'create'}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Birth Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(birthDate)}{calculateAge(birthDate)}
                </Text>
                <Text style={styles.dateButtonIcon}>📅</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={birthDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </View>

            <View style={[styles.section, styles.languageSection]}>
              <Text style={styles.label}>Languages *</Text>
              <View style={styles.languagesGrid}>
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    selectedLanguages.includes('english') && styles.selectedLanguage
                  ]}
                  onPress={() => toggleLanguage('english')}
                >
                  <Text style={styles.languageEmoji}>🇬🇧</Text>
                  <Text style={[
                    styles.languageText,
                    selectedLanguages.includes('english') && styles.selectedLanguageText
                  ]}>
                    English
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    selectedLanguages.includes('portuguese') && styles.selectedLanguage
                  ]}
                  onPress={() => toggleLanguage('portuguese')}
                >
                  <Text style={styles.languageEmoji}>🇧🇷</Text>
                  <Text style={[
                    styles.languageText,
                    selectedLanguages.includes('portuguese') && styles.selectedLanguageText
                  ]}>
                    Portuguese
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    selectedLanguages.includes('spanish') && styles.selectedLanguage
                  ]}
                  onPress={() => toggleLanguage('spanish')}
                >
                  <Text style={styles.languageEmoji}>🇪🇸</Text>
                  <Text style={[
                    styles.languageText,
                    selectedLanguages.includes('spanish') && styles.selectedLanguageText
                  ]}>
                    Spanish
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            {mode === 'edit' && onDelete && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    'Delete Child',
                    `Are you sure you want to delete ${child?.name}? This action cannot be undone and will remove all their data.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          onDelete();
                          handleClose();
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {mode === 'create' ? 'Add Child' : '✓'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  modal: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    minHeight: '70%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sublabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  dateButtonIcon: {
    fontSize: theme.fontSizes.lg,
  },
  languageButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  languageEmoji: {
    fontSize: theme.fontSizes.lg,
    marginRight: theme.spacing.md,
  },
  languageText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  languageSection: {
    marginBottom: theme.spacing.xs,
  },
});

export default ChildProfileModal;