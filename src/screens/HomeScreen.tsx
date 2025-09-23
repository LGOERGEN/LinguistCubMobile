import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, Child, AppData } from '../types';
import { dataService } from '../services/dataService';
import { theme, shadows } from '../constants/theme';
import ChildProfileModal from '../components/ChildProfileModal';
import LiveStatsComponent from '../components/LiveStatsComponent';
import AddWordModal from '../components/AddWordModal';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface WordItem {
  word: string;
  understanding: boolean;
  speaking: boolean;
  firstSpokenAge: number | null;
}

interface CategoryInfo {
  key: string;
  title: string;
  wordCount: number;
  emoji: string;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [expandedLanguage, setExpandedLanguage] = useState<'english' | 'portuguese' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [words, setWords] = useState<WordItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [showAddWordModal, setShowAddWordModal] = useState(false);

  const loadData = async () => {
    try {
      const data = await dataService.initializeData();
      setAppData(data);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddChild = () => {
    setEditingChild(null);
    setShowChildModal(true);
  };

  const handleSaveChild = async (
    name: string,
    birthDate: string | null,
    languages: ('english' | 'portuguese')[]
  ) => {
    try {
      if (editingChild) {
        await dataService.updateChild(editingChild.id, {
          name,
          birthDate,
          selectedLanguages: languages,
        });
      } else {
        await dataService.createChild(name, birthDate, languages);
      }
      await loadData();
    } catch (error) {
      Alert.alert('Error', `Failed to ${editingChild ? 'update' : 'add'} child`);
    }
  };

  const handleSelectChild = async (childId: string) => {
    try {
      await dataService.setActiveChild(childId);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to select child');
    }
  };

  const handleEditChild = (child: Child) => {
    Alert.alert(
      'Edit Child',
      `Edit ${child.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit Profile',
          onPress: () => {
            setEditingChild(child);
            setShowChildModal(true);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Child',
              `Are you sure you want to delete ${child.name}? This action cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await dataService.deleteChild(child.id);
                      await loadData();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete child');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return 'Age not set';

    const ageInMonths = dataService.calculateAgeInMonths(birthDate);
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    if (years > 0) {
      return `${years}y ${months}m`;
    }
    return `${months} months`;
  };

  const handleLanguagePress = (language: 'english' | 'portuguese') => {
    if (expandedLanguage === language) {
      setExpandedLanguage(null);
      setSelectedCategory('all');
      setWords([]);
      setCategories([]);
    } else {
      setExpandedLanguage(language);
      loadCategoriesForLanguage(language);
      setSelectedCategory('all');
    }
  };

  const loadCategoriesForLanguage = (language: 'english' | 'portuguese') => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return;

    const categoryData = activeChild.categories[language];
    if (categoryData) {
      const categoryList = Object.keys(categoryData)
        .filter(key => key !== 'other') // Exclude 'other' since we add it manually
        .map(key => ({
          key,
          title: categoryData[key].title,
          wordCount: categoryData[key].words.length,
          emoji: getCategoryEmoji(key),
        }));
      setCategories(categoryList);
      loadWordsForCategory('all', language, activeChild);
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

  const loadWordsForCategory = (categoryKey: string, language: 'english' | 'portuguese', child: Child) => {
    const categoryData = child.categories[language];
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

  const handleCategoryPress = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    const activeChild = dataService.getActiveChild();
    if (activeChild && expandedLanguage) {
      loadWordsForCategory(categoryKey, expandedLanguage, activeChild);
    }
  };

  const handleWordToggle = async (wordIndex: number, type: 'understanding' | 'speaking') => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild || !expandedLanguage) return;

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

        Alert.prompt(
          'Speaking Age',
          `At what age (in months) did ${activeChild.name} first say "${word.word}"?\n\nCurrent age: ${currentAge} months`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save',
              onPress: async (ageInput) => {
                if (!ageInput) return;

                const age = parseInt(ageInput);
                if (isNaN(age) || age < 0) {
                  Alert.alert('Invalid Age', 'Please enter a valid age in months.');
                  return;
                }

                if (age > currentAge) {
                  Alert.alert('Invalid Age', `Age cannot be greater than child's current age (${currentAge} months).`);
                  return;
                }

                await updateWordWithAge(wordIndex, type, newValue, age);
              }
            }
          ],
          'plain-text',
          currentAge.toString()
        );
        return;
      }

      // For understanding or unsetting speaking, proceed normally
      await updateWordWithAge(wordIndex, type, newValue, null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update word status');
    }
  };

  const updateWordWithAge = async (wordIndex: number, type: 'understanding' | 'speaking', newValue: boolean, age: number | null) => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild || !expandedLanguage) return;

    const word = words[wordIndex];
    const categoryData = activeChild.categories[expandedLanguage];
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

      await dataService.updateWordStatus(
        activeChild.id,
        expandedLanguage,
        targetCategory,
        targetWordIndex,
        updates
      );
      await loadData();
      loadCategoriesForLanguage(expandedLanguage);
    }
  };

  const handleAddWord = async (word: string, categoryKey: string) => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild || !expandedLanguage) return;

    try {
      await dataService.addCustomWord(activeChild.id, expandedLanguage, categoryKey, word);
      await loadData();
      loadCategoriesForLanguage(expandedLanguage);
    } catch (error) {
      Alert.alert('Error', 'Failed to add word');
    }
  };

  const getAllExistingWords = (): string[] => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild || !expandedLanguage) return [];

    const categoryData = activeChild.categories[expandedLanguage];
    let allWords: string[] = [];

    Object.values(categoryData).forEach(category => {
      category.words.forEach(word => {
        allWords.push(word.word);
      });
    });

    return allWords;
  };

  const renderCategoryTabs = () => {
    const activeChild = dataService.getActiveChild();
    const otherWordCount = activeChild && expandedLanguage
      ? activeChild.categories[expandedLanguage].other?.words.length || 0
      : 0;

    const allTabsData = [
      { key: 'all', title: 'All', wordCount: words.length, emoji: '📚' },
      ...categories,
      { key: 'other', title: 'Others', wordCount: otherWordCount, emoji: '📝' }
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {allTabsData.map(renderCategoryTab)}
      </ScrollView>
    );
  };

  const renderCategoryTab = (category: CategoryInfo | { key: string; title: string; wordCount: number; emoji: string }) => {
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

  const renderWordsList = () => {
    return (
      <View style={styles.wordsContainer}>
        <View style={styles.wordsHeader}>
          <Text style={styles.wordsTitle}>
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
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No words available</Text>
              <Text style={styles.emptySubtext}>Tap "Add Word" to get started</Text>
            </View>
          }
        />
      </View>
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

  const renderChildProfile = (child: Child) => {
    const isActive = appData?.activeChildId === child.id;

    return (
      <TouchableOpacity
        key={child.id}
        style={[
          styles.childCard,
          isActive && styles.activeChildCard,
        ]}
        onPress={() => handleSelectChild(child.id)}
        onLongPress={() => handleEditChild(child)}
      >
        <View style={styles.childAvatar}>
          <Text style={styles.childInitial}>
            {child.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childAge}>{calculateAge(child.birthDate)}</Text>
        {isActive && <Text style={styles.activeLabel}>Active</Text>}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const children = appData ? Object.values(appData.children) : [];
  const activeChild = dataService.getActiveChild();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Child Profiles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Children</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.childProfiles}>
            {children.map(renderChildProfile)}
            <TouchableOpacity
              style={styles.addChildCard}
              onPress={handleAddChild}
            >
              <View style={styles.addChildIcon}>
                <Text style={styles.addChildText}>+</Text>
              </View>
              <Text style={styles.addChildLabel}>Add Child</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Statistics Section */}
      {activeChild && (
        <LiveStatsComponent child={activeChild} language={expandedLanguage || 'english'} />
      )}

      {/* Language Sections */}
      {activeChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>

          {activeChild.selectedLanguages.includes('english') && (
            <View style={styles.languageSection}>
              <TouchableOpacity
                style={[styles.languageButton, expandedLanguage === 'english' && styles.expandedLanguageButton]}
                onPress={() => handleLanguagePress('english')}
              >
                <Text style={[styles.languageButtonText, expandedLanguage === 'english' && styles.expandedLanguageButtonText]}>🇬🇧 English Words</Text>
                <Text style={styles.expandIcon}>{expandedLanguage === 'english' ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {expandedLanguage === 'english' && (
                <View style={styles.expandedContent}>
                  {renderCategoryTabs()}
                  {renderWordsList()}
                </View>
              )}
            </View>
          )}

          {activeChild.selectedLanguages.includes('portuguese') && (
            <View style={styles.languageSection}>
              <TouchableOpacity
                style={[styles.languageButton, expandedLanguage === 'portuguese' && styles.expandedLanguageButton]}
                onPress={() => handleLanguagePress('portuguese')}
              >
                <Text style={[styles.languageButtonText, expandedLanguage === 'portuguese' && styles.expandedLanguageButtonText]}>🇧🇷 Portuguese Words</Text>
                <Text style={styles.expandIcon}>{expandedLanguage === 'portuguese' ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {expandedLanguage === 'portuguese' && (
                <View style={styles.expandedContent}>
                  {renderCategoryTabs()}
                  {renderWordsList()}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Settings Button */}
      {activeChild && (
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.textSecondary }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Welcome Message */}
      {children.length === 0 && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Linguist Cub! 🎉</Text>
          <Text style={styles.welcomeText}>
            Get started by adding your first child profile above. (Updated!)
          </Text>
        </View>
      )}

      <ChildProfileModal
        visible={showChildModal}
        onClose={() => setShowChildModal(false)}
        onSave={handleSaveChild}
        child={editingChild}
        mode={editingChild ? 'edit' : 'create'}
      />

      <AddWordModal
        visible={showAddWordModal}
        onClose={() => setShowAddWordModal(false)}
        onSave={handleAddWord}
        existingWords={getAllExistingWords()}
        categories={categories.map(cat => ({ key: cat.key, title: cat.title }))}
      />
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
  },
  loadingText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  childProfiles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childCard: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    minWidth: 100,
    ...shadows.sm,
  },
  activeChildCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  childInitial: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  childName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  childAge: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  activeLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: theme.spacing.xs,
  },
  addChildCard: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    minWidth: 100,
  },
  addChildIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addChildText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
  },
  addChildLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    gap: theme.spacing.md,
  },
  actionButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  welcomeContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  languageSection: {
    marginBottom: theme.spacing.md,
  },
  languageButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  expandedLanguageButton: {
    backgroundColor: theme.colors.primary,
  },
  languageButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  expandedLanguageButtonText: {
    color: '#ffffff',
  },
  expandIcon: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
  },
  expandedContent: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  tabsContainer: {
    maxHeight: 80,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
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
  wordsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  wordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  wordsTitle: {
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
    minHeight: 200,
    flexGrow: 0,
  },
  wordCard: {
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.surface,
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

export default HomeScreen;