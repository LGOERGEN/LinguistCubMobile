import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList, Child } from '../types';
import { dataService } from '../services/dataService';
import { theme, shadows } from '../constants/theme';

type Props = StackScreenProps<RootStackParamList, 'Categories'>;

interface CategoryInfo {
  key: string;
  title: string;
  wordCount: number;
  emoji: string;
}

const CategoriesScreen: React.FC<Props> = ({ route, navigation }) => {
  const { language } = route.params;
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);

  useEffect(() => {
    loadData();
  }, [language]);

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
    navigation.navigate('CategoryDetail', {
      language,
      categoryKey,
    });
  };

  const renderCategoryCard = (category: CategoryInfo) => (
    <TouchableOpacity
      key={category.key}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category.key)}
    >
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.wordCount}>
            {category.wordCount} {category.wordCount === 1 ? 'word' : 'words'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

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
          {language === 'english' ? '🇬🇧 English' : '🇧🇷 Portuguese'} Categories
        </Text>
        <Text style={styles.subtitle}>
          Track {activeChild.name}'s word development
        </Text>
      </View>

      <View style={styles.categoriesContainer}>
        {categories.map(renderCategoryCard)}
      </View>

      {categories.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories available</Text>
        </View>
      )}
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
  },
  categoriesContainer: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: theme.fontSizes.xl,
    marginRight: theme.spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  wordCount: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  chevron: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
    fontWeight: '300',
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

export default CategoriesScreen;