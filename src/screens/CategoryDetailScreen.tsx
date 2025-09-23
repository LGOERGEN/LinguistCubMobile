import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList, Child, Word } from '../types';
import { dataService } from '../services/dataService';
import { theme, shadows } from '../constants/theme';
import WordCard from '../components/WordCard';

type Props = StackScreenProps<RootStackParamList, 'CategoryDetail'>;

const CategoryDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { language, categoryKey } = route.params;
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddWord, setShowAddWord] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [language, categoryKey]);

  const loadData = async () => {
    try {
      const child = dataService.getActiveChild();
      if (!child) {
        Alert.alert('No Active Child', 'Please select a child from the home screen first.');
        navigation.goBack();
        return;
      }

      setActiveChild(child);

      const categoryData = child.categories[language]?.[categoryKey];
      if (categoryData) {
        setWords(categoryData.words);
        setCategoryTitle(categoryData.title);
      }
    } catch (error) {
      console.error('Error loading category data:', error);
      Alert.alert('Error', 'Failed to load category data');
    }
  };

  const handleToggleUnderstanding = async (wordIndex: number) => {
    if (!activeChild) return;

    try {
      const currentWord = words[wordIndex];
      await dataService.updateWordStatus(
        activeChild.id,
        language,
        categoryKey,
        wordIndex,
        { understanding: !currentWord.understanding }
      );
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update word status');
    }
  };

  const handleToggleSpeaking = async (wordIndex: number) => {
    if (!activeChild) return;

    try {
      const currentWord = words[wordIndex];
      const updates: { speaking: boolean; firstSpokenAge?: number | null } = {
        speaking: !currentWord.speaking,
      };

      if (!currentWord.speaking && !currentWord.firstSpokenAge) {
        const ageInMonths = activeChild.birthDate
          ? dataService.calculateAgeInMonths(activeChild.birthDate)
          : null;
        updates.firstSpokenAge = ageInMonths;
      }

      await dataService.updateWordStatus(
        activeChild.id,
        language,
        categoryKey,
        wordIndex,
        updates
      );
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update word status');
    }
  };

  const handleAddWord = async () => {
    if (!activeChild || !newWord.trim()) return;

    try {
      await dataService.addCustomWord(
        activeChild.id,
        language,
        categoryKey,
        newWord.trim()
      );
      setNewWord('');
      setShowAddWord(false);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add word');
    }
  };

  const filteredWords = words.filter(word =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProgressStats = () => {
    const understanding = words.filter(w => w.understanding).length;
    const speaking = words.filter(w => w.speaking).length;
    return { understanding, speaking, total: words.length };
  };

  const stats = getProgressStats();

  if (!activeChild) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noChildText}>No active child selected</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {language === 'english' ? '🇬🇧' : '🇧🇷'} {categoryTitle}
        </Text>
        <Text style={styles.subtitle}>
          {activeChild.name}'s progress
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.understanding}</Text>
            <Text style={styles.statLabel}>Understands</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.speaking}</Text>
            <Text style={styles.statLabel}>Says</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search words..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textSecondary}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddWord(!showAddWord)}
        >
          <Text style={styles.addButtonText}>
            {showAddWord ? 'Cancel' : '+ Add Word'}
          </Text>
        </TouchableOpacity>
      </View>

      {showAddWord && (
        <View style={styles.addWordContainer}>
          <TextInput
            style={styles.addWordInput}
            placeholder="Enter new word..."
            value={newWord}
            onChangeText={setNewWord}
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddWord}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.wordsContainer}>
        {filteredWords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No words match your search' : 'No words in this category'}
            </Text>
          </View>
        ) : (
          filteredWords.map((word, index) => {
            const originalIndex = words.findIndex(w => w.word === word.word);
            return (
              <WordCard
                key={`${word.word}-${index}`}
                word={word}
                onToggleUnderstanding={() => handleToggleUnderstanding(originalIndex)}
                onToggleSpeaking={() => handleToggleSpeaking(originalIndex)}
              />
            );
          })
        )}
      </View>
    </ScrollView>
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
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...shadows.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    ...shadows.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
    ...shadows.sm,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  addWordContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    paddingTop: 0,
    gap: theme.spacing.sm,
  },
  addWordInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  wordsContainer: {
    padding: theme.spacing.md,
    paddingTop: 0,
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
  },
});

export default CategoryDetailScreen;