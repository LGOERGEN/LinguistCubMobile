import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
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
        await dataService.updateWordStatus(
          activeChild.id,
          language,
          targetCategory,
          targetWordIndex,
          { [type]: newValue }
        );
        await loadData();
        loadWordsForCategory(selectedCategory);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update word status');
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
    const emojiMap: { [key: string]: string } = {
      family: '👨‍👩‍👧‍👦',
      food: '🍎',
      actions: '🤝',
      body: '👶',
      toys: '🧸',
      colors: '🌈',
      animals: '🐕',
      greetings: '🙏',
      social: '🙏',
      places: '🏠',
      other: '📝',
    };
    return emojiMap[categoryKey] || '📚';
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
        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
        <Text style={[styles.categoryTabTitle, isSelected && styles.selectedTabTitle]}>
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
            👂 Understands
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.wordButton, item.speaking && styles.activeWordButton]}
          onPress={() => handleWordToggle(index, 'speaking')}
        >
          <Text style={[styles.wordButtonText, item.speaking && styles.activeWordButtonText]}>
            🗣️ Speaks
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
    { key: 'all', title: 'All', wordCount: words.length, emoji: '📚' },
    ...categories,
    { key: 'other', title: 'Others', wordCount: categories.find(c => c.key === 'other')?.wordCount || 0, emoji: '📝' }
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
    maxHeight: 80,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    minWidth: 80,
  },
  selectedTab: {
    backgroundColor: theme.colors.primary,
  },
  categoryEmoji: {
    fontSize: theme.fontSizes.lg,
    marginBottom: theme.spacing.xs,
  },
  categoryTabTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  selectedTabTitle: {
    color: '#ffffff',
  },
  categoryTabCount: {
    fontSize: theme.fontSizes.xs,
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
});

export default CategoriesScreen;