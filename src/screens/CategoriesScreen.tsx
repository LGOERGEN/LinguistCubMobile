import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList, Child } from '../types';
import { dataService } from '../services/dataService';
import { theme, shadows } from '../constants/theme';
import LiveStatsComponent from '../components/LiveStatsComponent';
import AddWordModal from '../components/AddWordModal';

type Props = StackScreenProps<RootStackParamList, 'Categories'>;

interface CategoryInfo {
  key: string;
  title: string;
  wordCount: number;
  emoji: string;
}

interface WordItem {
  word: string;
  understanding: boolean;
  speaking: boolean;
  firstSpokenAge: number | null;
}

const CategoriesScreen: React.FC<Props> = ({ route, navigation }) => {
  const { language } = route.params;
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [words, setWords] = useState<WordItem[]>([]);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [ageInput, setAgeInput] = useState<string>('');
  const [currentWordData, setCurrentWordData] = useState<{
    wordIndex: number;
    type: 'understanding' | 'speaking';
    newValue: boolean;
    word: WordItem;
    currentAge: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [language]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [language])
  );

  useEffect(() => {
    if (activeChild) {
      loadWordsForCategory(selectedCategory);
    }
  }, [selectedCategory, activeChild]);

  const loadData = async () => {
    try {
      const child = dataService.getActiveChild();
      if (!child) {
        Alert.alert('No Active Child', 'Please select a child from the home screen first.');
        navigation.goBack();
        return;
      }

      setActiveChild(child);

      const categoryData = child.categories[language];
      if (categoryData) {
        const categoryList = Object.keys(categoryData).map(key => ({
          key,
          title: categoryData[key].title,
          wordCount: categoryData[key].words.length,
          emoji: getCategoryEmoji(key),
        }));
        setCategories(categoryList);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const loadWordsForCategory = (categoryKey: string) => {
    if (!activeChild) return;

    const categoryData = activeChild.categories[language];
    let allWords: WordItem[] = [];

    if (categoryKey === 'all') {
      Object.values(categoryData).forEach(category => {
        allWords = allWords.concat(category.words);
      });
    } else if (categoryKey === 'other') {
      if (categoryData.other) {
        allWords = categoryData.other.words;
      }
    } else {
      if (categoryData[categoryKey]) {
        allWords = categoryData[categoryKey].words;
      }
    }

    setWords(allWords);
  };

  const handleAddWord = async (word: string, categoryKey: string) => {
    if (!activeChild) return;

    try {
      await dataService.addCustomWord(activeChild.id, language, categoryKey, word);
      await loadData();
      loadWordsForCategory(selectedCategory);
    } catch (error) {
      Alert.alert('Error', 'Failed to add word');
    }
  };

  const handleWordToggle = async (wordIndex: number, type: 'understanding' | 'speaking') => {
    if (!activeChild) return;

    try {
      const word = words[wordIndex];
      const newValue = !word[type];

      // If marking as speaking and it's not already spoken, prompt for age
      if (type === 'speaking' && newValue && !word.speaking) {
        const currentAge = activeChild.birthDate ? dataService.calculateAgeInMonths(activeChild.birthDate) : null;

        if (currentAge === null) {
          Alert.alert('Age Required', 'Please set a birth date for this child to track speaking ages.');
          return;
        }

        setCurrentWordData({
          wordIndex,
          type,
          newValue,
          word,
          currentAge
        });
        setAgeInput(currentAge.toString());
        setShowAgeModal(true);
        return;
      }

      // For understanding or unsetting speaking, proceed normally
      await updateWordWithAge(wordIndex, type, newValue, null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update word status');
    }
  };

  const handleAgeModalSave = async () => {
    if (!currentWordData || !activeChild) return;

    const age = parseInt(ageInput);
    if (isNaN(age) || age < 0) {
      Alert.alert('Invalid Age', 'Please enter a valid age in months.');
      return;
    }

    if (age > currentWordData.currentAge) {
      Alert.alert('Invalid Age', `Age cannot be greater than child's current age (${currentWordData.currentAge} months).`);
      return;
    }

    await updateWordWithAge(currentWordData.wordIndex, currentWordData.type, currentWordData.newValue, age);

    // If marking as speaking, also mark as understanding
    if (currentWordData.type === 'speaking' && currentWordData.newValue && !currentWordData.word.understanding) {
      await updateWordWithAge(currentWordData.wordIndex, 'understanding', true, null);
    }

    setShowAgeModal(false);
    setCurrentWordData(null);
    setAgeInput('');
  };

  const handleAgeModalCancel = () => {
    setShowAgeModal(false);
    setCurrentWordData(null);
    setAgeInput('');
  };

  const updateWordWithAge = async (wordIndex: number, type: 'understanding' | 'speaking', newValue: boolean, age: number | null) => {
    if (!activeChild) return;

    const word = words[wordIndex];
    const categoryData = activeChild.categories[language];
    let targetCategory = '';
    let targetWordIndex = -1;

    // Find which category this word belongs to and its index within that category
    if (selectedCategory === 'all') {
      for (const [catKey, category] of Object.entries(categoryData)) {
        const index = category.words.findIndex(w => w.word === word.word);
        if (index !== -1) {
          targetCategory = catKey;
          targetWordIndex = index;
          break;
        }
      }
    } else {
      targetCategory = selectedCategory;
      targetWordIndex = wordIndex;
    }

    if (targetCategory && targetWordIndex !== -1) {
      const updates: any = { [type]: newValue };

      // If marking as speaking, set the age
      if (type === 'speaking' && newValue && age !== null) {
        updates.firstSpokenAge = age;
      }

      // If unsetting speaking, clear the age
      if (type === 'speaking' && !newValue) {
        updates.firstSpokenAge = null;
      }

      try {
        await dataService.updateWordStatus(
          activeChild.id,
          language,
          targetCategory,
          targetWordIndex,
          updates
        );
        await loadData();
        loadWordsForCategory(selectedCategory);
      } catch (error) {
        console.error('Error updating word status:', error);
        Alert.alert('Error', 'Failed to update word status');
      }
    } else {
      console.error('Could not find target category/word:', { word: word.word, selectedCategory, targetCategory, targetWordIndex });
      Alert.alert('Error', 'Could not find word to update. Please try again.');
    }
  };

  const getAllExistingWords = (): string[] => {
    if (!activeChild) return [];

    const categoryData = activeChild.categories[language];
    let allWords: string[] = [];

    Object.values(categoryData).forEach(category => {
      category.words.forEach(word => {
        allWords.push(word.word);
      });
    });

    return allWords;
  };

  const getCategoryEmoji = (categoryKey: string): string => {
    return '';
  };

  const handleCategoryPress = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const renderCategoryTab = (category: CategoryInfo) => {
    const isSelected = selectedCategory === category.key;
    return (
      <TouchableOpacity
        key={category.key}
        style={[styles.categoryTab, isSelected && styles.selectedTab]}
        onPress={() => handleCategoryPress(category.key)}
      >
        <Text
          style={[styles.categoryTabTitle, isSelected && styles.selectedTabTitle]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {category.title}
        </Text>
        <Text style={[styles.categoryTabCount, isSelected && styles.selectedTabCount]}>
          {category.wordCount}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderWordCard = ({ item, index }: { item: WordItem; index: number }) => (
    <View style={styles.wordCard}>
      <Text style={styles.wordText}>{item.word}</Text>
      <View style={styles.wordActions}>
        <TouchableOpacity
          style={[styles.wordButton, item.understanding && styles.activeWordButton]}
          onPress={() => handleWordToggle(index, 'understanding')}
        >
          <Text style={[styles.wordButtonText, item.understanding && styles.activeWordButtonText]}>
            Understands
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.wordButton, item.speaking && styles.activeWordButton]}
          onPress={() => handleWordToggle(index, 'speaking')}
        >
          <Text style={[styles.wordButtonText, item.speaking && styles.activeWordButtonText]}>
            Speaks
          </Text>
        </TouchableOpacity>
      </View>
      {item.firstSpokenAge && (
        <Text style={styles.ageText}>First spoken at {item.firstSpokenAge} months</Text>
      )}
    </View>
  );

  if (!activeChild) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noChildText}>No active child selected</Text>
      </View>
    );
  }

  const allTabsData = [
    { key: 'all', title: 'All', wordCount: words.length, emoji: '' },
    ...categories,
    { key: 'other', title: 'Others', wordCount: categories.find(c => c.key === 'other')?.wordCount || 0, emoji: '' }
  ];

  return (
    <View style={styles.container}>
      {activeChild && (
        <LiveStatsComponent
          child={activeChild}
          language={language}
          selectedCategory={selectedCategory}
        />
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {allTabsData.map(renderCategoryTab)}
      </ScrollView>

      <View style={styles.contentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Words' :
             selectedCategory === 'other' ? 'Custom Words' :
             categories.find(c => c.key === selectedCategory)?.title || 'Words'}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddWordModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Word</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={words}
          renderItem={renderWordCard}
          keyExtractor={(item, index) => `${item.word}-${index}`}
          style={styles.wordsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No words available</Text>
              <Text style={styles.emptySubtext}>Tap "Add Word" to get started</Text>
            </View>
          }
        />
      </View>

      <AddWordModal
        visible={showAddWordModal}
        onClose={() => setShowAddWordModal(false)}
        onSave={handleAddWord}
        existingWords={getAllExistingWords()}
        categories={categories.map(cat => ({ key: cat.key, title: cat.title }))}
      />

      <Modal
        visible={showAgeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleAgeModalCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ageModalContent}>
            <Text style={styles.ageModalTitle}>Speaking Age</Text>
            <Text style={styles.ageModalSubtitle}>
              {currentWordData && activeChild &&
                `At what age (in months) did ${activeChild.name} first say "${currentWordData.word.word}"?`
              }
            </Text>
            <Text style={styles.ageModalCurrentAge}>
              Current age: {currentWordData?.currentAge || 0} months
            </Text>

            <TextInput
              style={styles.ageInput}
              value={ageInput}
              onChangeText={setAgeInput}
              keyboardType="numeric"
              placeholder="Age in months"
              autoFocus
              selectTextOnFocus
            />

            <View style={styles.ageModalButtons}>
              <TouchableOpacity
                style={[styles.ageModalButton, styles.ageModalCancelButton]}
                onPress={handleAgeModalCancel}
              >
                <Text style={styles.ageModalSymbol}>×</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ageModalButton, styles.ageModalSaveButton]}
                onPress={handleAgeModalSave}
              >
                <Text style={[styles.ageModalSymbol, { color: '#ffffff' }]}>✔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  tabsContainer: {
    maxHeight: 60,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  categoryTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    minWidth: 60,
    maxWidth: 100,
    height: 44,
  },
  selectedTab: {
    backgroundColor: theme.colors.primary,
  },
  categoryEmoji: {
    fontSize: theme.fontSizes.lg,
    marginBottom: theme.spacing.xs,
  },
  categoryTabTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 1,
    lineHeight: 12,
  },
  selectedTabTitle: {
    color: '#ffffff',
  },
  categoryTabCount: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  selectedTabCount: {
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  wordsList: {
    flex: 1,
  },
  wordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...shadows.sm,
  },
  wordText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  wordActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  wordButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeWordButton: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  wordButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  activeWordButtonText: {
    color: '#ffffff',
  },
  ageText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  noChildText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  ageModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  ageModalTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  ageModalSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  ageModalCurrentAge: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    width: '100%',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  ageModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: theme.spacing.xl,
  },
  ageModalButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageModalCancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ageModalSaveButton: {
    backgroundColor: theme.colors.primary,
  },
  ageModalSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default CategoriesScreen;