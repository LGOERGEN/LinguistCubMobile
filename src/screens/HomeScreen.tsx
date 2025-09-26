import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { captureRef } from 'react-native-view-shot';

import { RootStackParamList, Child, AppData } from '../types';
import { dataService } from '../services/dataService';
import { theme, shadows, gradients } from '../constants/theme';
import { VALIDATION_LIMITS } from '../constants/validation';
import ChildProfileModal from '../components/ChildProfileModal';
import LiveStatsComponent from '../components/LiveStatsComponent';
import AddWordModal from '../components/AddWordModal';
import { generateHTMLReport } from '../components/ReportGenerator';

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
  const [expandedLanguage, setExpandedLanguage] = useState<'english' | 'portuguese' | 'spanish' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [words, setWords] = useState<WordItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null);
  const [tempAge, setTempAge] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<WordItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [wordFilter, setWordFilter] = useState<'all' | 'understood' | 'spoken'>('all');
  const [globalFilteredWords, setGlobalFilteredWords] = useState<(WordItem & { language: string })[]>([]);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const [isGeneratingSocialPost, setIsGeneratingSocialPost] = useState(false);
  const [showSocialBranding, setShowSocialBranding] = useState(false);
  const liveStatsRef = useRef<View>(null);

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

  const handleExportReport = async () => {
    try {
      setIsExporting(true);

      const activeChild = dataService.getActiveChild();
      console.log('Active child:', activeChild ? activeChild.name : 'None');

      if (!activeChild) {
        Alert.alert('No Child Selected', 'Please select or create a child profile first.');
        return;
      }

      console.log('Generating HTML report...');
      // Generate HTML report
      const htmlContent = generateHTMLReport(activeChild);
      console.log('HTML content generated, length:', htmlContent.length);

      console.log('Converting to PDF...');
      // Convert HTML to PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      console.log('PDF created at:', uri);

      console.log('Checking sharing availability...');
      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        console.log('Sharing PDF...');
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${activeChild.name}'s Language Development Report`,
          UTI: 'public.pdf',
        });
        console.log('PDF shared successfully');
      } else {
        Alert.alert('Sharing not available', 'PDF generated but sharing is not available on this device.');
        return;
      }

      Alert.alert('Export Successful', `${activeChild.name}'s language development report has been generated and is ready to share!`);
    } catch (error) {
      console.error('Export report error details:', error);
      Alert.alert('Export Failed', `Failed to generate PDF report: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSocialMediaShare = async () => {
    try {
      setIsGeneratingSocialPost(true);

      const activeChild = dataService.getActiveChild();
      if (!activeChild) {
        Alert.alert('No Child Selected', 'Please select or create a child profile first.');
        return;
      }

      // Show social media branding elements temporarily
      setShowSocialBranding(true);

      // Wait a moment for the UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture screenshot of the Overall Progress section
      if (!liveStatsRef.current) {
        Alert.alert('Error', 'Unable to capture progress section. Please try again.');
        setShowSocialBranding(false);
        return;
      }

      const imageUri = await captureRef(liveStatsRef.current, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // Hide social media branding elements
      setShowSocialBranding(false);

      // Share the image
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          dialogTitle: `Share ${activeChild.name}'s Language Progress`,
          UTI: 'public.png',
        });
      } else {
        Alert.alert('Sharing not available', 'Image generated but sharing is not available on this device.');
        return;
      }

      Alert.alert('Share Successful', `${activeChild.name}'s progress has been captured and is ready to share!`);
    } catch (error) {
      console.error('Social media share error:', error);
      Alert.alert('Share Failed', `Failed to capture progress section: ${error.message || 'Unknown error'}. Please try again.`);
      setShowSocialBranding(false);
    } finally {
      setIsGeneratingSocialPost(false);
    }
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
    languages: ('english' | 'portuguese' | 'spanish')[]
  ) => {
    try {
      if (editingChild) {
        // Check if any languages were removed
        const removedLanguages = editingChild.selectedLanguages.filter(
          lang => !languages.includes(lang)
        );

        await dataService.updateChild(editingChild.id, {
          name,
          birthDate,
          selectedLanguages: languages,
        });

        // Remove language data for removed languages
        if (removedLanguages.length > 0) {
          for (const removedLang of removedLanguages) {
            await dataService.removeLanguageData(editingChild.id, removedLang);
          }
        }

        // Detect newly added languages and restore their default data
        const addedLanguages = languages.filter(
          lang => !editingChild.selectedLanguages.includes(lang)
        );

        if (addedLanguages.length > 0) {
          for (const addedLang of addedLanguages) {
            await dataService.restoreLanguageData(editingChild.id, addedLang);
          }
        }

        // If languages were removed and we're currently viewing one of them, reset the view
        if (removedLanguages.includes(expandedLanguage as any)) {
          setExpandedLanguage(null);
          setSelectedCategory('all');
          setWords([]);
          setCategories([]);
          setWordFilter('all');
        }
      } else {
        await dataService.createChild(name, birthDate, languages);
        // Reset UI state for new child
        setExpandedLanguage(null);
        setSelectedCategory('all');
        setWords([]);
        setCategories([]);
        setWordFilter('all');
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
      // Reset UI state when switching to different child
      setExpandedLanguage(null);
      setSelectedCategory('all');
      setWords([]);
      setCategories([]);
      setWordFilter('all');
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

  const handleLanguagePress = (language: 'english' | 'portuguese' | 'spanish') => {
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

  const loadCategoriesForLanguage = (language: 'english' | 'portuguese' | 'spanish', preserveCategory?: boolean) => {
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
        }))
        .concat([{
          key: 'other',
          title: categoryData.other ? categoryData.other.title : 'Other',
          wordCount: categoryData.other ? categoryData.other.words.length : 0,
          emoji: getCategoryEmoji('other'),
        }]);
      setCategories(categoryList);

      // Only load words for 'all' if we're not preserving the current category
      if (!preserveCategory) {
        loadWordsForCategory('all', language, activeChild);
      } else {
        // Load words for the current selected category
        loadWordsForCategory(selectedCategory, language, activeChild);
      }
    }
  };

  const getCategoryEmoji = (categoryKey: string): string => {
    return '';
  };

  const loadWordsForCategory = (categoryKey: string, language: 'english' | 'portuguese' | 'spanish', child: Child) => {
    const categoryData = child.categories[language];
    if (!categoryData) return;

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

  const getFilteredWords = () => {
    switch (wordFilter) {
      case 'understood':
        return words.filter(word => word.understanding);
      case 'spoken':
        return words.filter(word => word.speaking);
      default:
        return words;
    }
  };

  const handleFilterPress = (filter: 'all' | 'understood' | 'spoken') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWordFilter(filter);

    // When filtering, close any currently expanded individual language
    setExpandedLanguage(null);

    // Update global filtered words for cross-language filtering
    const allWords = getAllWordsFromAllLanguages();
    let filteredWords = allWords;

    switch (filter) {
      case 'understood':
        filteredWords = allWords.filter(word => word.understanding);
        break;
      case 'spoken':
        filteredWords = allWords.filter(word => word.speaking);
        break;
      default:
        filteredWords = allWords;
    }

    setGlobalFilteredWords(filteredWords);
  };

  const getFilteredWordsForLanguage = (language: 'english' | 'portuguese' | 'spanish') => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return [];

    const categoryData = activeChild.categories[language];
    let allWords: WordItem[] = [];

    // Get all words from this language
    Object.values(categoryData).forEach(category => {
      allWords = allWords.concat(category.words);
    });

    // Apply the current filter
    switch (wordFilter) {
      case 'understood':
        return allWords.filter(word => word.understanding);
      case 'spoken':
        return allWords.filter(word => word.speaking);
      default:
        return allWords;
    }
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

  const handleWordToggle = async (wordIndex: number, type: 'understanding' | 'speaking', language?: string) => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return;

    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      let word: WordItem;
      let targetLanguage: string;

      // Determine which array to get the word from
      if (wordFilter !== 'all' && !expandedLanguage) {
        // We're in filter mode - get word from filtered language-specific array
        if (!language) {
          Alert.alert('Error', 'Language not specified for filtered word');
          return;
        }
        const filteredWords = getFilteredWordsForLanguage(language as 'english' | 'portuguese' | 'spanish');
        word = filteredWords[wordIndex];
        targetLanguage = language;
      } else if (expandedLanguage) {
        // We're in individual language expanded mode
        const filteredWords = isSearching ? searchResults : getFilteredWords();
        word = filteredWords[wordIndex];
        targetLanguage = expandedLanguage;
      } else {
        Alert.alert('Error', 'Cannot determine word context');
        return;
      }

      if (!word) {
        console.error('Word not found at index:', wordIndex, 'Array length:', isSearching ? searchResults.length : getFilteredWords().length);
        console.error('Context - isSearching:', isSearching, 'expandedLanguage:', expandedLanguage, 'wordFilter:', wordFilter);
        Alert.alert('Error', `Word not found at position ${wordIndex}. Please try refreshing the word list.`);
        return;
      }

      console.log('Word toggle for:', word.word, 'type:', type, 'newValue:', !word[type]);

      const newValue = !word[type];

      // Handle deselection of "understands" - should also deselect "speaks"
      if (type === 'understanding' && !newValue && word.speaking) {
        // If deselecting "understands" and word is currently marked as "speaks",
        // we need to deselect both - do this in a single update to avoid double refresh
        const activeChild = dataService.getActiveChild();
        if (!activeChild) return;

        try {
          const updateLanguage = targetLanguage || expandedLanguage;
          if (updateLanguage) {
            const categoryData = activeChild.categories[updateLanguage as 'english' | 'portuguese' | 'spanish'];
            let targetCategory = '';
            let targetWordIndex = -1;

            // Find which category this word belongs to
            for (const [catKey, category] of Object.entries(categoryData)) {
              const index = category.words.findIndex(w => w.word === word.word);
              if (index !== -1) {
                targetCategory = catKey;
                targetWordIndex = index;
                console.log('Found word in category:', catKey, 'at index:', index);
                break;
              }
            }

            if (!targetCategory || targetWordIndex === -1) {
              console.error('Failed to find word in any category:', word.word);
              console.error('Available categories:', Object.keys(categoryData));
              Alert.alert('Error', 'Unable to locate word in data structure');
              return;
            }

            if (targetCategory && targetWordIndex !== -1) {
              // Update both understanding and speaking in a single call
              await dataService.updateWordStatus(
                activeChild.id,
                updateLanguage as 'english' | 'portuguese' | 'spanish',
                targetCategory,
                targetWordIndex,
                { understanding: false, speaking: false, firstSpokenAge: null }
              );
              await loadData();
              if (expandedLanguage) {
                loadCategoriesForLanguage(expandedLanguage, true);
              }
            }
          }
        } catch (error) {
          console.error('Error in deselection:', error);
          Alert.alert('Error', 'Failed to update word status');
        }
        return;
      }

      // If marking as speaking and it's not already spoken, show age selector
      if (type === 'speaking' && newValue && !word.speaking) {
        const currentAge = activeChild.birthDate ? dataService.calculateAgeInMonths(activeChild.birthDate) : null;

        if (currentAge === null) {
          Alert.alert('Age Required', 'Please set a birth date for this child to track speaking ages.');
          return;
        }

        // Show integrated age selector - store the word object, not just index
        setEditingWordIndex(wordIndex);
        setTempAge(currentAge);
        return;
      }

      // For all other operations (including deselecting "speaks"), update directly
      if (targetLanguage) {
        await updateWordByTextInLanguage(word.word, targetLanguage, type, newValue, null);
      } else {
        await updateWordByText(word.word, type, newValue, null);
      }
    } catch (error) {
      console.error('Error in handleWordToggle:', error);
      Alert.alert('Error', 'Failed to update word status');
    }
  };

  const updateWordByText = async (wordText: string, type: 'understanding' | 'speaking', newValue: boolean, age: number | null) => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild || !expandedLanguage) return;

    const categoryData = activeChild.categories[expandedLanguage];
    let targetCategory = '';
    let targetWordIndex = -1;

    // Find which category this word belongs to by searching all categories
    for (const [catKey, category] of Object.entries(categoryData)) {
      const index = category.words.findIndex(w => w.word === wordText);
      if (index !== -1) {
        targetCategory = catKey;
        targetWordIndex = index;
        break;
      }
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
        loadCategoriesForLanguage(expandedLanguage, true);
      } catch (error) {
        console.error('Error updating word status:', error);
        Alert.alert('Error', 'Failed to update word status');
      }
    } else {
      console.error('Could not find word in any category:', { wordText, expandedLanguage });
      Alert.alert('Error', 'Could not find word to update. Please try again.');
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
        loadCategoriesForLanguage(expandedLanguage, true);
      } catch (error) {
        console.error('Error updating word status:', error);
        Alert.alert('Error', 'Failed to update word status');
      }
    } else {
      console.error('Could not find target category/word:', { word: word.word, selectedCategory, targetCategory, targetWordIndex });
      Alert.alert('Error', 'Could not find word to update. Please try again.');
    }
  };

  const handleAddWord = async (word: string, categoryKey: string, language?: string) => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return;

    try {
      // If language is provided, use it; otherwise use expanded language or first available language
      const targetLanguage = language || expandedLanguage || activeChild.selectedLanguages[0];

      await dataService.addCustomWord(activeChild.id, targetLanguage, categoryKey, word);
      await loadData();

      if (expandedLanguage) {
        // Preserve the current category selection when refreshing
        loadCategoriesForLanguage(expandedLanguage, true);
      }

      // Clear the search query and reset filter after adding
      setSearchQuery('');
      setIsSearching(false);
      setShowGlobalSearch(false);
      setSelectedCategory('all');
    } catch (error) {
      Alert.alert('Error', 'Failed to add word');
    }
  };

  const getAllExistingWords = (): string[] => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return [];

    let allWords: string[] = [];

    // If we have an expanded language, get words from that language only
    if (expandedLanguage) {
      const categoryData = activeChild.categories[expandedLanguage];
      if (categoryData) {
        Object.values(categoryData).forEach(category => {
          category.words.forEach(word => {
            allWords.push(word.word);
          });
        });
      }
    } else {
      // Otherwise, get words from all selected languages
      activeChild.selectedLanguages.forEach(language => {
        const categoryData = activeChild.categories[language];
        if (categoryData) {
          Object.values(categoryData).forEach(category => {
            category.words.forEach(word => {
              allWords.push(word.word);
            });
          });
        }
      });
    }

    return allWords;
  };

  const getCategoriesForAddModal = () => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return [];

    // If we have an expanded language, get categories from that language only
    if (expandedLanguage) {
      return categories;
    } else {
      // For global context, get categories from English if available, otherwise from first selected language
      const preferredLanguage = activeChild.selectedLanguages.includes('english')
        ? 'english'
        : activeChild.selectedLanguages[0];
      const categoryData = activeChild.categories[preferredLanguage];
      if (!categoryData) return [];

      return Object.keys(categoryData)
        .filter(key => key !== 'other')
        .map(key => ({
          key,
          title: categoryData[key].title,
        }))
        .concat([{ key: 'other', title: categoryData.other ? categoryData.other.title : 'Other' }]);
    }
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
    if (!categoryData) {
      setSearchResults([]);
      return;
    }

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

  const renderCategoryTabs = (contextLanguage?: 'english' | 'portuguese' | 'spanish') => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return null;

    // Determine which language context to use
    const targetLanguage = contextLanguage || expandedLanguage;
    if (!targetLanguage) return null;

    // Get categories for the specific language context
    const categoryData = activeChild.categories[targetLanguage];
    if (!categoryData) return null;

    const contextCategories = Object.keys(categoryData)
      .filter(key => key !== 'other')
      .map(key => ({
        key,
        title: categoryData[key].title,
        wordCount: categoryData[key].words.length,
        emoji: getCategoryEmoji(key),
      }))
      .concat([{
        key: 'other',
        title: categoryData.other ? categoryData.other.title : 'Other',
        wordCount: categoryData.other ? categoryData.other.words.length : 0,
        emoji: getCategoryEmoji('other'),
      }]);

    // Calculate total words for this language
    const totalWords = Object.values(categoryData).reduce((sum, category) => sum + category.words.length, 0);

    const allTabsData = [
      { key: 'all', title: 'All', wordCount: totalWords, emoji: '' },
      ...contextCategories
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {allTabsData.map((category) => renderCategoryTab(category, targetLanguage))}
      </ScrollView>
    );
  };

  const renderCategoryTab = (category: CategoryInfo | { key: string; title: string; wordCount: number; emoji: string }, language?: string) => {
    const isSelected = selectedCategory === category.key;
    // Create unique key by combining category key with language to prevent duplicates
    const uniqueKey = language ? `${language}-${category.key}` : category.key;

    return (
      <TouchableOpacity
        key={uniqueKey}
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
    const displayWords = isSearching ? searchResults : getFilteredWords();
    const showSearchResults = isSearching && searchQuery.trim();

    return (
      <View style={styles.wordsContainer}>
        <View style={styles.wordsHeader}>
          <Text style={styles.wordsTitle}>
            {showSearchResults ? `Search Results` :
             selectedCategory === 'all' ? 'All Words' :
             selectedCategory === 'other' ? (categories.find(c => c.key === 'other')?.title || 'Other') :
             categories.find(c => c.key === selectedCategory)?.title || 'Words'}
          </Text>
        </View>


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
            showSearchResults ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No words found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : !isSearching ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No words available</Text>
                <Text style={styles.emptySubtext}>Use the global search above to add words</Text>
              </View>
            ) : null
          }
        />
      </View>
    );
  };

  const handleDeleteWord = (wordIndex: number) => {
    // Get the word from the filtered display array
    const filteredWords = isSearching ? searchResults : getFilteredWords();
    const word = filteredWords[wordIndex];

    if (!word) {
      console.error('Delete: Word not found at index:', wordIndex, 'Array length:', filteredWords.length);
      console.error('Delete context - isSearching:', isSearching, 'expandedLanguage:', expandedLanguage);
      Alert.alert('Error', `Word not found at position ${wordIndex}. Please refresh and try again.`);
      return;
    }

    console.log('Attempting to delete word:', word.word, 'from language:', expandedLanguage);

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

              // Find which category this word belongs to by searching all categories
              for (const [catKey, category] of Object.entries(categoryData)) {
                const index = category.words.findIndex(w => w.word === word.word);
                if (index !== -1) {
                  targetCategory = catKey;
                  targetWordIndex = index;
                  console.log('Delete: Found word in category:', catKey, 'at index:', index);
                  break;
                }
              }

              if (targetCategory && targetWordIndex !== -1) {
                console.log('Delete: Calling removeWord for:', word.word);
                await dataService.removeWord(
                  activeChild.id,
                  expandedLanguage,
                  targetCategory,
                  targetWordIndex
                );
                console.log('Delete: Successfully removed word, refreshing data');
                await loadData();
                loadCategoriesForLanguage(expandedLanguage, true);
                console.log('Delete: Data refresh complete');
              } else {
                console.error('Delete: Could not find word in any category:', word.word);
                console.error('Delete: Available categories:', Object.keys(categoryData));
                Alert.alert('Error', `Could not locate "${word.word}" in the data structure. The word may have been recently modified.`);
              }
            } catch (error) {
              console.error('Error deleting word:', error);
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
      // Get the word from the filtered display array
      const filteredWords = isSearching ? searchResults : getFilteredWords();
      const word = filteredWords[editingWordIndex];

      if (!word) {
        Alert.alert('Error', 'Word not found');
        setEditingWordIndex(null);
        return;
      }

      // Mark word as speaking with age
      await updateWordByText(word.word, 'speaking', true, tempAge);

      // If the word is not already understood, mark it as understood too
      if (!word.understanding) {
        await updateWordByText(word.word, 'understanding', true, null);
      }

      setEditingWordIndex(null);
    }
  };

  const cancelAgeSelection = () => {
    setEditingWordIndex(null);
  };

  const getAllWordsFromAllLanguages = () => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return [];

    let allWords: (WordItem & { language: string })[] = [];

    // Get words from all selected languages
    activeChild.selectedLanguages.forEach(language => {
      const categoryData = activeChild.categories[language];
      if (categoryData) {
        Object.values(categoryData).forEach(category => {
          category.words.forEach(word => {
            allWords.push({ ...word, language });
          });
        });
      }
    });

    return allWords;
  };

  const renderGlobalWordFilter = () => {
    if (!activeChild) return null;

    const allWords = getAllWordsFromAllLanguages();
    const understoodWords = allWords.filter(w => w.understanding);
    const spokenWords = allWords.filter(w => w.speaking);

    return (
      <View style={styles.globalFilterContainer}>
        <Text style={styles.globalFilterTitle}>Word Filter (All Languages)</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, wordFilter === 'all' && styles.activeFilterButton]}
            onPress={() => handleFilterPress('all')}
          >
            <Text style={[styles.filterButtonText, wordFilter === 'all' && styles.activeFilterButtonText]}>
              All ({allWords.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, wordFilter === 'understood' && styles.activeFilterButton]}
            onPress={() => handleFilterPress('understood')}
          >
            <Text style={[styles.filterButtonText, wordFilter === 'understood' && styles.activeFilterButtonText]}>
              Understood ({understoodWords.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, wordFilter === 'spoken' && styles.activeFilterButton]}
            onPress={() => handleFilterPress('spoken')}
          >
            <Text style={[styles.filterButtonText, wordFilter === 'spoken' && styles.activeFilterButtonText]}>
              Spoken ({spokenWords.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWordsListForFilter = (language: 'english' | 'portuguese' | 'spanish') => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return null;

    // Get filtered words organized by category
    const getFilteredWordsByCategory = () => {
      const categoryData = activeChild.categories[language];
      if (!categoryData) return [];

      let displayWords: WordItem[] = [];

      if (selectedCategory === 'all') {
        // Show all filtered words from all categories
        Object.values(categoryData).forEach(category => {
          const filteredCategoryWords = category.words.filter(word => {
            switch (wordFilter) {
              case 'understood':
                return word.understanding;
              case 'spoken':
                return word.speaking;
              default:
                return true;
            }
          });
          displayWords = displayWords.concat(filteredCategoryWords);
        });
      } else {
        // Show filtered words from selected category only
        const category = categoryData[selectedCategory];
        if (category) {
          displayWords = category.words.filter(word => {
            switch (wordFilter) {
              case 'understood':
                return word.understanding;
              case 'spoken':
                return word.speaking;
              default:
                return true;
            }
          });
        }
      }

      return displayWords;
    };

    const displayWords = getFilteredWordsByCategory();

    return (
      <View style={styles.wordsContainer}>
        <View style={styles.wordsHeader}>
          <Text style={styles.wordsTitle}>
            {selectedCategory === 'all' ? 'All Words' :
             selectedCategory === 'other' ? (categories.find(c => c.key === 'other')?.title || 'Other') :
             categories.find(c => c.key === selectedCategory)?.title || 'Words'} - {
             wordFilter === 'understood' ? 'Understands' :
             wordFilter === 'spoken' ? 'Speaks' : 'All'
            }
          </Text>
        </View>

        <FlatList
          data={displayWords}
          renderItem={({ item, index }) => renderWordCard({ item, index }, language)}
          keyExtractor={(item, index) => `${language}-${item.word}-${index}`}
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No words match this filter</Text>
              <Text style={styles.emptySubtext}>Try selecting a different category or filter</Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderFilteredLanguageSection = (language: 'english' | 'portuguese' | 'spanish') => {
    const filteredWords = getFilteredWordsForLanguage(language);

    if (filteredWords.length === 0) {
      return null; // Don't show empty language sections
    }

    const languageColors = {
      english: theme.colors.english,
      portuguese: theme.colors.portuguese,
      spanish: theme.colors.spanish
    };

    const languageNames = {
      english: 'English',
      portuguese: 'Portuguese',
      spanish: 'Spanish'
    };

    const isExpanded = expandedLanguage === language;

    return (
      <View key={`filtered-${language}`} style={styles.languageSection}>
        <TouchableOpacity
          onPress={() => handleLanguagePress(language)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isExpanded
              ? [languageColors[language], languageColors[language]]
              : ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={[styles.languageButton, isExpanded && styles.expandedLanguageButton]}
          >
            <Text style={[
              styles.languageButtonText,
              isExpanded && styles.expandedLanguageButtonText
            ]}>
              {languageNames[language]} Words ({filteredWords.length})
            </Text>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {renderCategoryTabs(language)}
            {renderWordsListForFilter(language)}
          </View>
        )}
      </View>
    );
  };

  const renderGlobalSearchBar = () => {
    return (
      <View style={styles.globalSearchContainer}>
        <TextInput
          style={[styles.searchInput, styles.flexSearchInput]}
          placeholder="Search all words across all languages..."
          value={searchQuery}
          onChangeText={handleGlobalSearch}
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddWordModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Word</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setIsSearching(false);
      setShowGlobalSearch(false);
      return;
    }

    setIsSearching(true);
    setShowGlobalSearch(true);

    const activeChild = dataService.getActiveChild();
    if (!activeChild) {
      setSearchResults([]);
      return;
    }

    const allWords = getAllWordsFromAllLanguages();
    const results = allWords.filter(word =>
      word.word.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
  };

  const renderGlobalWordView = () => {
    if (!showGlobalSearch && !isSearching) return null;

    const displayWords = isSearching ? searchResults : globalFilteredWords;
    const title = isSearching ? 'Search Results' :
                  wordFilter === 'understood' ? 'Words Child Understands' :
                  wordFilter === 'spoken' ? 'Words Child Speaks' : 'All Words';

    return (
      <View style={styles.globalWordsContainer}>
        <View style={styles.globalWordsHeader}>
          <Text style={styles.globalWordsTitle}>{title}</Text>
          <TouchableOpacity
            style={styles.closeGlobalButton}
            onPress={() => {
              setShowGlobalSearch(false);
              setIsSearching(false);
              setSearchQuery('');
              setWordFilter('all');
            }}
          >
            <Text style={styles.closeGlobalButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {isSearching && searchResults.length === 0 && searchQuery.trim() && (
          <TouchableOpacity
            style={styles.addWordFromSearchButton}
            onPress={() => {
              setShowAddWordModal(true);
            }}
          >
            <Text style={styles.addWordFromSearchText}>
              + Add "{searchQuery}" as new word
            </Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={displayWords}
          renderItem={renderGlobalWordCard}
          keyExtractor={(item, index) => `${item.word}-${item.language}-${index}`}
          style={styles.globalWordsList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.wordsRow}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isSearching ? 'No words found' : 'No words match this filter'}
              </Text>
              <Text style={styles.emptySubtext}>
                {isSearching ? 'Try a different search term' : 'Try selecting different words in the language sections'}
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  const renderGlobalWordCard = useCallback(({ item, index }: { item: WordItem & { language: string }; index: number }) => {
    const languageColor = item.language === 'english' ? theme.colors.english :
                         item.language === 'portuguese' ? theme.colors.portuguese :
                         theme.colors.spanish;

    return (
      <View style={[styles.wordCard, styles.globalWordCard]}>
        <View style={styles.wordHeader}>
          <Text style={styles.wordText}>{item.word}</Text>
          <View style={[styles.languageBadge, { backgroundColor: languageColor }]}>
            <Text style={styles.languageBadgeText}>
              {item.language.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.wordActions}>
          <TouchableOpacity
            style={[styles.wordButton, item.understanding && styles.activeWordButton]}
            onPress={() => handleGlobalWordToggle(item, 'understanding')}
          >
            <Text style={[styles.wordButtonText, item.understanding && styles.activeWordButtonText]}>
              Understands
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.wordButton, item.speaking && styles.activeWordButton]}
            onPress={() => handleGlobalWordToggle(item, 'speaking')}
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
  }, []);

  const handleGlobalWordToggle = async (word: WordItem & { language: string }, type: 'understanding' | 'speaking') => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return;

    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const newValue = !word[type];

      // If marking as speaking and it's not already spoken, show age selector
      if (type === 'speaking' && newValue && !word.speaking) {
        const currentAge = activeChild.birthDate ? dataService.calculateAgeInMonths(activeChild.birthDate) : null;

        if (currentAge === null) {
          Alert.alert('Age Required', 'Please set a birth date for this child to track speaking ages.');
          return;
        }

        // For global words, we'll use the first speaking age directly
        await updateWordByTextInLanguage(word.word, word.language, type, newValue, currentAge);
        return;
      }

      // For other operations
      await updateWordByTextInLanguage(word.word, word.language, type, newValue, null);
    } catch (error) {
      console.error('Error in handleGlobalWordToggle:', error);
      Alert.alert('Error', 'Failed to update word status');
    }
  };

  const updateWordByTextInLanguage = async (
    wordText: string,
    language: string,
    type: 'understanding' | 'speaking',
    newValue: boolean,
    age: number | null
  ) => {
    const activeChild = dataService.getActiveChild();
    if (!activeChild) return;

    const categoryData = activeChild.categories[language as 'english' | 'portuguese' | 'spanish'];
    let targetCategory = '';
    let targetWordIndex = -1;

    // Find which category this word belongs to
    for (const [catKey, category] of Object.entries(categoryData)) {
      const index = category.words.findIndex(w => w.word === wordText);
      if (index !== -1) {
        targetCategory = catKey;
        targetWordIndex = index;
        break;
      }
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
          language as 'english' | 'portuguese' | 'spanish',
          targetCategory,
          targetWordIndex,
          updates
        );
        await loadData();

        // Refresh the global filtered words if we're in filter mode
        if (wordFilter !== 'all') {
          // Recalculate and update filtered words
          const allWords = getAllWordsFromAllLanguages();
          let filteredWords = allWords;

          switch (wordFilter) {
            case 'understood':
              filteredWords = allWords.filter(word => word.understanding);
              break;
            case 'spoken':
              filteredWords = allWords.filter(word => word.speaking);
              break;
            default:
              filteredWords = allWords;
          }

          setGlobalFilteredWords(filteredWords);
        }

        // Also refresh the current language's words if we're in expanded mode
        if (expandedLanguage) {
          loadCategoriesForLanguage(expandedLanguage, true);
        }
      } catch (error) {
        console.error('Error updating word status:', error);
        Alert.alert('Error', 'Failed to update word status');
      }
    } else {
      console.error('Could not find word in language:', { wordText, language });
      Alert.alert('Error', 'Could not find word to update. Please try again.');
    }
  };

  const renderWordCard = useCallback(({ item, index }: { item: WordItem; index: number }, language?: string) => {
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
              onPress={() => handleWordToggle(index, 'understanding', language)}
            >
              <Text style={[styles.wordButtonText, item.understanding && styles.activeWordButtonText]}>
                Understands
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.wordButton, item.speaking && styles.activeWordButton]}
              onPress={() => handleWordToggle(index, 'speaking', language)}
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
        onScrollBeginDrag={() => setShowDropdownMenu(false)}
      >
        {/* Header with Logo and Title */}
        <View style={styles.header}>
          <Image
            source={require('../../Visuals_transparent/Linguist Cub.png')}
            style={styles.combinedLogoTitle}
            resizeMode="contain"
          />

          {/* Dropdown Menu */}
          {activeChild && (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDropdownMenu(!showDropdownMenu)}
              >
                <Text style={styles.dropdownButtonIcon}>⋯</Text>
              </TouchableOpacity>

              {showDropdownMenu && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={styles.dropdownMenuItem}
                    onPress={() => {
                      setShowDropdownMenu(false);
                      handleExportReport();
                    }}
                    disabled={isExporting}
                  >
                    <Text style={styles.dropdownMenuText}>
                      {isExporting ? 'Generating Report...' : 'Share Report'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownMenuItem}
                    onPress={() => {
                      setShowDropdownMenu(false);
                      handleSocialMediaShare();
                    }}
                    disabled={isGeneratingSocialPost}
                  >
                    <Text style={styles.dropdownMenuText}>
                      {isGeneratingSocialPost ? 'Generating Post...' : 'Share on Social Media'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropdownMenuItem}
                    onPress={() => {
                      setShowDropdownMenu(false);
                      navigation.navigate('Settings');
                    }}
                  >
                    <Text style={styles.dropdownMenuText}>Settings</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
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
        <View ref={liveStatsRef} collapsable={false} style={showSocialBranding ? styles.screenshotContainer : undefined}>
          {showSocialBranding ? (
            <LinearGradient
              colors={gradients.background}
              style={styles.screenshotBackground}
              locations={[0, 0.6, 1]}
            >
              {/* Header with Logo and Branding for Social Media */}
              <View style={styles.socialHeader}>
                <Image
                  source={require('../../Visuals_transparent/Linguist Cub.png')}
                  style={styles.socialLogo}
                  resizeMode="contain"
                />
                <Text style={styles.socialTagline}>Track Your Baby's Language Journey</Text>
              </View>

              <LiveStatsComponent child={activeChild} language={expandedLanguage || 'english'} />

              {/* Footer for Social Media */}
              <View style={styles.socialFooter}>
                <Text style={styles.socialAppStores}>Linguist Cub - Available on App Store & Google Play</Text>
              </View>
            </LinearGradient>
          ) : (
            <LiveStatsComponent child={activeChild} language={expandedLanguage || 'english'} />
          )}
        </View>
      )}

      {/* Global Search Bar */}
      {activeChild && renderGlobalSearchBar()}

      {/* Global Word Filter */}
      {renderGlobalWordFilter()}

      {/* Global Word View */}
      {renderGlobalWordView()}

      {/* Language Sections */}
      {activeChild && !isSearching && (
        <View style={styles.section}>
          {wordFilter !== 'all' ? (
            // Show filtered language sections when filtering is active
            <>
              {activeChild.selectedLanguages.includes('english') && renderFilteredLanguageSection('english')}
              {activeChild.selectedLanguages.includes('portuguese') && renderFilteredLanguageSection('portuguese')}
              {activeChild.selectedLanguages.includes('spanish') && renderFilteredLanguageSection('spanish')}
            </>
          ) : (
            // Show normal expandable sections when no filter is active
            <>
              {activeChild.selectedLanguages.includes('english') && (
                <View style={styles.languageSection}>
                  <TouchableOpacity
                    onPress={() => handleLanguagePress('english')}
                  >
                    <LinearGradient
                      colors={expandedLanguage === 'english' ? [theme.colors.english, theme.colors.english] : gradients.card}
                      style={[styles.languageButton, expandedLanguage === 'english' && styles.expandedLanguageButton]}
                    >
                      <Text style={[styles.languageButtonText, expandedLanguage === 'english' && styles.expandedLanguageButtonText]}>English Words</Text>
                      <Text style={styles.expandIcon}>{expandedLanguage === 'english' ? '▼' : '▶'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {expandedLanguage === 'english' && (
                    <View style={styles.expandedContent}>
                      {renderCategoryTabs('english')}
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
                      colors={expandedLanguage === 'portuguese' ? [theme.colors.portuguese, theme.colors.portuguese] : gradients.card}
                      style={[styles.languageButton, expandedLanguage === 'portuguese' && styles.expandedLanguageButton]}
                    >
                      <Text style={[styles.languageButtonText, expandedLanguage === 'portuguese' && styles.expandedLanguageButtonText]}>Portuguese Words</Text>
                      <Text style={styles.expandIcon}>{expandedLanguage === 'portuguese' ? '▼' : '▶'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {expandedLanguage === 'portuguese' && (
                    <View style={styles.expandedContent}>
                      {renderCategoryTabs('portuguese')}
                      {renderWordsList()}
                    </View>
                  )}
                </View>
              )}

              {activeChild.selectedLanguages.includes('spanish') && (
                <View style={styles.languageSection}>
                  <TouchableOpacity
                    onPress={() => handleLanguagePress('spanish')}
                  >
                    <LinearGradient
                      colors={expandedLanguage === 'spanish' ? [theme.colors.spanish, theme.colors.spanish] : gradients.card}
                      style={[styles.languageButton, expandedLanguage === 'spanish' && styles.expandedLanguageButton]}
                    >
                      <Text style={[styles.languageButtonText, expandedLanguage === 'spanish' && styles.expandedLanguageButtonText]}>Spanish Words</Text>
                      <Text style={styles.expandIcon}>{expandedLanguage === 'spanish' ? '▼' : '▶'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {expandedLanguage === 'spanish' && (
                    <View style={styles.expandedContent}>
                      {renderCategoryTabs('spanish')}
                      {renderWordsList()}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
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
        existingChildNames={children.map(child => child.name)}
        existingChildren={children}
        maxProfilesReached={children.length >= VALIDATION_LIMITS.MAX_CHILD_PROFILES}
      />

      <AddWordModal
        visible={showAddWordModal}
        onClose={() => setShowAddWordModal(false)}
        onSave={handleAddWord}
        existingWords={getAllExistingWords()}
        categories={getCategoriesForAddModal()}
        initialWord={searchQuery}
        languages={activeChild?.selectedLanguages}
        allCategories={activeChild?.categories}
      />
      </ScrollView>

      {/* Floating Collapse Button - Fixed to Screen Position */}
      {expandedLanguage && (
        <TouchableOpacity
          style={styles.floatingCollapseButton}
          onPress={() => setExpandedLanguage(null)}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingCollapseIcon}>↑</Text>
          <Text style={styles.floatingCollapseText}>Close</Text>
        </TouchableOpacity>
      )}
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
    paddingTop: theme.spacing.md,
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
    width: '48%',
    marginHorizontal: '1%',
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
    justifyContent: 'flex-start',
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
    height: 189,
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
  flexSearchInput: {
    flex: 1,
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeFilterButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  globalFilterContainer: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...shadows.md,
  },
  globalFilterTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  globalSearchContainer: {
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  globalWordsContainer: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...shadows.md,
  },
  globalWordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  globalWordsTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  closeGlobalButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
  },
  closeGlobalButtonText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  globalWordsList: {
    maxHeight: 400,
  },
  globalWordCard: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  languageBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageBadgeText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.xs,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1000,
  },
  dropdownButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  dropdownButtonIcon: {
    fontSize: 20,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    minWidth: 180,
    ...shadows.lg,
    paddingVertical: theme.spacing.sm,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  dropdownMenuIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  dropdownMenuText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    flex: 1,
  },
  screenshotContainer: {
    // Container for the screenshot capture
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
  },
  screenshotBackground: {
    // Background gradient for the screenshot
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  socialHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  socialLogo: {
    width: 182, // 30% bigger than 140
    height: 91,  // 30% bigger than 70
    marginBottom: theme.spacing.xs,
  },
  socialTagline: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'System',
  },
  socialFooter: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  socialAppStores: {
    fontSize: theme.fontSizes.xs,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.3,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  collapseButtonContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  collapseButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 80, 0.2)',
    ...shadows.sm,
  },
  collapseButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  floatingCollapseButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minWidth: 80,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  floatingCollapseIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    marginRight: theme.spacing.xs,
  },
  floatingCollapseText: {
    fontSize: theme.fontSizes.sm,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;