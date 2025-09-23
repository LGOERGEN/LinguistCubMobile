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
  Image,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, Child, AppData } from '../types';
import { dataService } from '../services/dataService';
import { theme, shadows, gradients } from '../constants/theme';
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
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null);
  const [tempAge, setTempAge] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<WordItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleDeleteChild = async () => {
    if (!editingChild) return;

    try {
      await dataService.deleteChild(editingChild.id);
      await loadData();
      setEditingChild(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete child profile');
    }
  };

  const handleSelectChild = async (childId: string) => {
    // Add haptic feedback for child selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
    return '';
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
    // Add haptic feedback for category selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedCategory(categoryKey);
    const activeChild = dataService.getActiveChild();
    if (activeChild && expandedLanguage) {
      loadWordsForCategory(categoryKey, expandedLanguage, activeChild);
    }
  };

  const handleWordToggle = async (wordIndex: number, type: 'understanding' | 'speaking') => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild || !expandedLanguage) return;

    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const word = words[wordIndex];
      const newValue = !word[type];

      // If marking as speaking and it's not already spoken, show age selector
      if (type === 'speaking' && newValue && !word.speaking) {
        const currentAge = activeChild.birthDate ? dataService.calculateAgeInMonths(activeChild.birthDate) : null;

        if (currentAge === null) {
          Alert.alert('Age Required', 'Please set a birth date for this child to track speaking ages.');
          return;
        }

        // Show integrated age selector
        setEditingWordIndex(wordIndex);
        setTempAge(currentAge);
        return;
      }

      // If marking as understanding, proceed normally
      if (type === 'understanding') {
        await updateWordWithAge(wordIndex, type, newValue, null);
        return;
      }

      // If unsetting speaking, proceed normally
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

      try {
        await dataService.updateWordStatus(
          activeChild.id,
          expandedLanguage,
          targetCategory,
          targetWordIndex,
          updates
        );
        await loadData();
        loadCategoriesForLanguage(expandedLanguage);
      } catch (error) {
        console.error('Error updating word status:', error);
        Alert.alert('Error', 'Failed to update word status');
      }
    } else {
      console.error('Could not find target category/word:', { word: word.word, selectedCategory, targetCategory, targetWordIndex });
      Alert.alert('Error', 'Could not find word to update. Please try again.');
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const activeChild = dataService.getActiveChild();
    if (!activeChild || !expandedLanguage) {
      setSearchResults([]);
      return;
    }

    const categoryData = activeChild.categories[expandedLanguage];
    let results: WordItem[] = [];

    Object.values(categoryData).forEach(category => {
      category.words.forEach(word => {
        if (word.word.toLowerCase().includes(query.toLowerCase())) {
          results.push(word);
        }
      });
    });

    setSearchResults(results);
  };

  const handleAddWordFromSearch = () => {
    if (!searchQuery.trim()) return;

    // Clear search and show modal with the searched word
    setShowAddWordModal(true);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const renderCategoryTabs = () => {
    const activeChild = dataService.getActiveChild();
    const otherWordCount = activeChild && expandedLanguage
      ? activeChild.categories[expandedLanguage].other?.words.length || 0
      : 0;

    const allTabsData = [
      { key: 'all', title: 'All', wordCount: words.length, emoji: '' },
      ...categories,
      { key: 'other', title: 'Others', wordCount: otherWordCount, emoji: '' }
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

  const renderSearchBar = () => {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search words..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>
    );
  };

  const renderWordsList = () => {
    const displayWords = isSearching ? searchResults : words;
    const showSearchResults = isSearching && searchQuery.trim();
    const showAddWordOption = isSearching && searchResults.length === 0 && searchQuery.trim();

    return (
      <View style={styles.wordsContainer}>
        <View style={styles.wordsHeader}>
          <Text style={styles.wordsTitle}>
            {showSearchResults ? `Search Results` :
             selectedCategory === 'all' ? 'All Words' :
             selectedCategory === 'other' ? 'Custom Words' :
             categories.find(c => c.key === selectedCategory)?.title || 'Words'}
          </Text>
          {!isSearching && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddWordModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Word</Text>
            </TouchableOpacity>
          )}
        </View>

        {showAddWordOption && (
          <TouchableOpacity
            style={styles.addWordFromSearchButton}
            onPress={handleAddWordFromSearch}
          >
            <Text style={styles.addWordFromSearchText}>
              + Add "{searchQuery}" as new word
            </Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={displayWords}
          renderItem={renderWordCard}
          keyExtractor={(item, index) => `${item.word}-${index}`}
          style={styles.wordsList}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={10}
          scrollEnabled={false}
          numColumns={2}
          columnWrapperStyle={styles.wordsRow}
          ListEmptyComponent={
            showSearchResults && !showAddWordOption ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No words found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : !isSearching ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No words available</Text>
                <Text style={styles.emptySubtext}>Tap "Add Word" to get started</Text>
              </View>
            ) : null
          }
        />
      </View>
    );
  };

  const handleDeleteWord = (wordIndex: number) => {
    const word = words[wordIndex];
    Alert.alert(
      'Delete Word',
      `Are you sure you want to delete "${word.word}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const activeChild = dataService.getActiveChild();
            if (!activeChild || !expandedLanguage) return;

            try {
              const categoryData = activeChild.categories[expandedLanguage];
              let targetCategory = '';
              let targetWordIndex = -1;

              // Find which category this word belongs to
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
                await dataService.removeWord(
                  activeChild.id,
                  expandedLanguage,
                  targetCategory,
                  targetWordIndex
                );
                await loadData();
                loadCategoriesForLanguage(expandedLanguage);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete word');
            }
          }
        }
      ]
    );
  };

  const handleAgeChange = (direction: 'up' | 'down') => {
    const activeChild = dataService.getActiveChild();
    const currentAge = activeChild?.birthDate ? dataService.calculateAgeInMonths(activeChild.birthDate) : 60;

    if (direction === 'up' && tempAge < currentAge) {
      setTempAge(tempAge + 1);
    } else if (direction === 'down' && tempAge > 0) {
      setTempAge(tempAge - 1);
    }
  };

  const confirmAgeSelection = async () => {
    if (editingWordIndex !== null) {
      const word = words[editingWordIndex];

      // Mark word as speaking with age
      await updateWordWithAge(editingWordIndex, 'speaking', true, tempAge);

      // If the word is not already understood, mark it as understood too
      if (!word.understanding) {
        await updateWordWithAge(editingWordIndex, 'understanding', true, null);
      }

      setEditingWordIndex(null);
    }
  };

  const cancelAgeSelection = () => {
    setEditingWordIndex(null);
  };

  const renderWordCard = useCallback(({ item, index }: { item: WordItem; index: number }) => {
    return (
    <View style={styles.wordCard}>
      <View style={styles.wordHeader}>
        <Text style={styles.wordText}>{item.word}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteWord(index)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      {editingWordIndex === index ? (
        <View style={styles.ageSelector}>
          <Text style={styles.ageSelectorTitle}>At what age did they first say this word?</Text>
          <View style={styles.ageControls}>
            <TouchableOpacity
              style={styles.ageButton}
              onPress={() => handleAgeChange('down')}
            >
              <Text style={styles.ageButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.ageDisplay}>{tempAge} months</Text>
            <TouchableOpacity
              style={styles.ageButton}
              onPress={() => handleAgeChange('up')}
            >
              <Text style={styles.ageButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ageActions}>
            <TouchableOpacity style={styles.ageCancelButton} onPress={cancelAgeSelection}>
              <Text style={styles.ageSymbolText}>×</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ageConfirmButton} onPress={confirmAgeSelection}>
              <Text style={[styles.ageSymbolText, { color: '#ffffff' }]}>✔</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
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
      )}

      {item.firstSpokenAge && editingWordIndex !== index && (
        <Text style={styles.ageText}>First spoken at {item.firstSpokenAge} months</Text>
      )}
    </View>
    );
  }, [editingWordIndex, handleWordToggle, confirmAgeSelection, cancelAgeSelection]);

  const renderChildProfile = (child: Child) => {
    const isActive = appData?.activeChildId === child.id;

    return (
      <TouchableOpacity
        key={child.id}
        onPress={() => handleSelectChild(child.id)}
        onLongPress={() => handleEditChild(child)}
      >
        <View style={[
          styles.childCard,
          isActive && styles.activeChildCard,
        ]}>
          <View style={styles.childAvatar}>
            <Text style={styles.childInitial}>
              {child.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childAge}>{calculateAge(child.birthDate)}</Text>
          {isActive && <Text style={styles.activeLabel}>Active</Text>}
          {isActive && (
            <View style={styles.childActions}>
              <TouchableOpacity
                style={styles.editChildButton}
                onPress={() => {
                  setEditingChild(child);
                  setShowChildModal(true);
                }}
              >
                <Text style={styles.editChildButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteChildButton}
                onPress={() => {
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
                }}
              >
                <Text style={styles.deleteChildButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    <LinearGradient
      colors={gradients.background}
      style={styles.container}
      locations={[0, 0.6, 1]}
    >
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo and Title */}
        <View style={styles.header}>
          <Image
            source={require('../../Visuals_transparent/Linguist Cub.png')}
            style={styles.combinedLogoTitle}
            resizeMode="contain"
          />
        </View>

        {/* Child Profiles Section */}
        <View style={styles.section}>
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
                onPress={() => handleLanguagePress('english')}
              >
                <LinearGradient
                  colors={expandedLanguage === 'english' ? gradients.primaryCard : gradients.card}
                  style={[styles.languageButton, expandedLanguage === 'english' && styles.expandedLanguageButton]}
                >
                  <Text style={[styles.languageButtonText, expandedLanguage === 'english' && styles.expandedLanguageButtonText]}>English Words</Text>
                  <Text style={styles.expandIcon}>{expandedLanguage === 'english' ? '▼' : '▶'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {expandedLanguage === 'english' && (
                <View style={styles.expandedContent}>
                  {renderSearchBar()}
                  {renderCategoryTabs()}
                  {renderWordsList()}
                </View>
              )}
            </View>
          )}

          {activeChild.selectedLanguages.includes('portuguese') && (
            <View style={styles.languageSection}>
              <TouchableOpacity
                onPress={() => handleLanguagePress('portuguese')}
              >
                <LinearGradient
                  colors={expandedLanguage === 'portuguese' ? gradients.primaryCard : gradients.card}
                  style={[styles.languageButton, expandedLanguage === 'portuguese' && styles.expandedLanguageButton]}
                >
                  <Text style={[styles.languageButtonText, expandedLanguage === 'portuguese' && styles.expandedLanguageButtonText]}>Portuguese Words</Text>
                  <Text style={styles.expandIcon}>{expandedLanguage === 'portuguese' ? '▼' : '▶'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {expandedLanguage === 'portuguese' && (
                <View style={styles.expandedContent}>
                  {renderSearchBar()}
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
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Welcome Message */}
      {children.length === 0 && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Linguist Cub!</Text>
          <Text style={styles.welcomeText}>
            Get started by adding your first child profile above.
          </Text>
        </View>
      )}

      <ChildProfileModal
        visible={showChildModal}
        onClose={() => setShowChildModal(false)}
        onSave={handleSaveChild}
        onDelete={editingChild ? handleDeleteChild : undefined}
        child={editingChild}
        mode={editingChild ? 'edit' : 'create'}
      />

      <AddWordModal
        visible={showAddWordModal}
        onClose={() => setShowAddWordModal(false)}
        onSave={handleAddWord}
        existingWords={getAllExistingWords()}
        categories={categories.map(cat => ({ key: cat.key, title: cat.title }))}
        initialWord={searchQuery}
      />
      </ScrollView>
    </LinearGradient>
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
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: theme.spacing.lg,
    fontFamily: 'System',
    textShadowColor: 'rgba(44, 62, 80, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  childProfiles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childCard: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    minWidth: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeChildCard: {
    borderWidth: 3,
    borderColor: '#2C3E50',
  },
  childAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...shadows.lg,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  childInitial: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  childName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
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
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...shadows.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
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
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.md,
  },
  expandedLanguageButton: {

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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    minWidth: 60,
    maxWidth: 100,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 80, 0.1)',
    ...shadows.sm,
  },
  selectedTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryEmoji: {
    fontSize: theme.fontSizes.md,
    marginBottom: 2,
  },
  categoryTabTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 10,
    paddingHorizontal: 2,
  },
  selectedTabTitle: {
    color: '#ffffff',
  },
  categoryTabCount: {
    fontSize: 8,
    color: '#2C3E50',
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    ...shadows.sm,
  },
  wordText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  wordActions: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  wordsRow: {
    justifyContent: 'space-between',
  },
  wordButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 80, 0.2)',
  },
  activeWordButton: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  wordButtonText: {
    fontSize: theme.fontSizes.xs,
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
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  deleteButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    minWidth: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#9e9e9e',
    fontSize: theme.fontSizes.sm,
    fontWeight: '300',
  },
  ageSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    minHeight: 140,
  },
  ageSelectorTitle: {
    fontSize: theme.fontSizes.xs,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  ageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  ageButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  ageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ageDisplay: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    color: theme.colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  ageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  ageCancelButton: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ageConfirmButton: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageSymbolText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  editChildButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  editChildButtonText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.xs,
    fontWeight: '600',
  },
  childActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  deleteChildButton: {
    backgroundColor: 'rgba(158, 158, 158, 0.2)',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  deleteChildButtonText: {
    color: '#9e9e9e',
    fontSize: theme.fontSizes.xs,
    fontWeight: '300',
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    paddingBottom: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: -25,
  },
  logo: {
    width: 80,
    height: 80,
  },
  combinedLogoTitle: {
    width: '100%',
    height: 270,
    alignSelf: 'center',
    marginBottom: -20,
  },
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadows.sm,
  },
  addWordFromSearchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  addWordFromSearchText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
});

export default HomeScreen;