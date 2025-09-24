import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import { theme, shadows } from '../constants/theme';

interface AddWordModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (word: string, category: string, language?: string) => void;
  existingWords: string[];
  categories: { key: string; title: string }[];
  initialWord?: string;
  languages?: ('english' | 'portuguese' | 'spanish')[];
}

const AddWordModal: React.FC<AddWordModalProps> = ({
  visible,
  onClose,
  onSave,
  existingWords,
  categories,
  initialWord,
  languages,
}) => {
  const [word, setWord] = useState(initialWord || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'portuguese' | 'spanish' | ''>('');

  // Update word when initialWord prop changes
  useEffect(() => {
    if (visible) {
      setWord(initialWord || '');
    }
  }, [visible, initialWord]);

  const handleSave = () => {
    if (!word.trim()) {
      Alert.alert('Invalid Word', 'Please enter a word');
      return;
    }

    // Check if word already exists (case insensitive)
    const wordExists = existingWords.some(
      existingWord => existingWord.toLowerCase() === word.trim().toLowerCase()
    );

    if (wordExists) {
      Alert.alert('Word Already Exists', 'This word is already in the categories');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category for this word');
      return;
    }

    // Check if language is required
    if (languages && languages.length > 1 && !selectedLanguage) {
      Alert.alert('Select Language', 'Please select a language for this word');
      return;
    }

    onSave(word.trim(), selectedCategory, selectedLanguage || undefined);
    handleClose();
  };

  const handleClose = () => {
    setWord(initialWord || '');
    setSelectedCategory('');
    setSelectedLanguage('');
    onClose();
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
            <Text style={styles.title}>Add New Word</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.label}>Word *</Text>
              <TextInput
                style={styles.input}
                value={word}
                onChangeText={setWord}
                placeholder="Enter word"
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {languages && languages.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.label}>Language *</Text>
                <Text style={styles.sublabel}>Select which language this word belongs to</Text>

                {languages.map((language) => (
                  <TouchableOpacity
                    key={language}
                    style={[
                      styles.categoryButton,
                      selectedLanguage === language && styles.selectedCategory
                    ]}
                    onPress={() => setSelectedLanguage(language)}
                  >
                    <View style={styles.categoryRow}>
                      <View style={[
                        styles.radio,
                        selectedLanguage === language && styles.radioSelected
                      ]} />
                      <Text style={[
                        styles.categoryText,
                        selectedLanguage === language && styles.selectedCategoryText
                      ]}>
                        {language === 'english' ? 'English' :
                         language === 'portuguese' ? 'Portuguese' : 'Spanish'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Category *</Text>
              <Text style={styles.sublabel}>Select which category this word belongs to</Text>

              {categories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.key && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <View style={styles.categoryRow}>
                    <View style={[
                      styles.radio,
                      selectedCategory === category.key && styles.radioSelected
                    ]} />
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.key && styles.selectedCategoryText
                    ]}>
                      {category.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Add Word</Text>
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
    minHeight: '60%',
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
    paddingVertical: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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
  categoryButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedCategory: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
  },
  radioSelected: {
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
  },
  categoryText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedCategoryText: {
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
});

export default AddWordModal;