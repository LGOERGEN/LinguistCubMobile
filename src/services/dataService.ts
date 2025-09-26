import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Child, LanguageData } from '../types';
import { getDefaultLanguageData, getDefaultDataForLanguage } from '../constants/defaultData';

const STORAGE_KEY = 'LinguistCubData';
const STORAGE_VERSION = '1.0.0';

class DataService {
  private data: AppData | null = null;

  async initializeData(): Promise<AppData> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedData) {
        this.data = JSON.parse(storedData);
        // Migrate data if needed
        this.data = await this.migrateData(this.data!);
      } else {
        // Create initial data structure
        this.data = {
          children: {},
          activeChildId: null,
          version: STORAGE_VERSION,
        };
      }

      return this.data;
    } catch (error) {
      console.error('Error initializing data:', error);
      // Return default data structure on error
      this.data = {
        children: {},
        activeChildId: null,
        version: STORAGE_VERSION,
      };
      return this.data;
    }
  }

  async saveData(): Promise<void> {
    if (!this.data) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  getData(): AppData | null {
    return this.data;
  }

  async createChild(name: string, birthDate: string | null, selectedLanguages: ('english' | 'portuguese' | 'spanish')[]): Promise<string> {
    if (!this.data) {
      await this.initializeData();
    }

    const childId = Date.now().toString();
    const now = new Date().toISOString();

    const newChild: Child = {
      id: childId,
      name,
      birthDate,
      selectedLanguages,
      categories: getDefaultLanguageData(),
      createdAt: now,
      lastModified: now,
    };

    this.data!.children[childId] = newChild;

    // Set as active child if it's the first one
    if (!this.data!.activeChildId) {
      this.data!.activeChildId = childId;
    }

    await this.saveData();
    return childId;
  }

  async updateChild(childId: string, updates: Partial<Child>): Promise<void> {
    if (!this.data || !this.data.children[childId]) {
      throw new Error('Child not found');
    }

    this.data.children[childId] = {
      ...this.data.children[childId],
      ...updates,
      lastModified: new Date().toISOString(),
    };

    await this.saveData();
  }

  async deleteChild(childId: string): Promise<void> {
    if (!this.data || !this.data.children[childId]) {
      throw new Error('Child not found');
    }

    delete this.data.children[childId];

    // If deleted child was active, switch to another child
    if (this.data.activeChildId === childId) {
      const remainingChildIds = Object.keys(this.data.children);
      this.data.activeChildId = remainingChildIds.length > 0 ? remainingChildIds[0] : null;
    }

    await this.saveData();
  }

  async setActiveChild(childId: string): Promise<void> {
    if (!this.data) {
      await this.initializeData();
    }

    if (!this.data!.children[childId]) {
      throw new Error('Child not found');
    }

    this.data!.activeChildId = childId;
    await this.saveData();
  }

  getActiveChild(): Child | null {
    if (!this.data || !this.data.activeChildId) {
      return null;
    }

    return this.data.children[this.data.activeChildId] || null;
  }

  async updateWordStatus(
    childId: string,
    language: 'english' | 'portuguese' | 'spanish',
    categoryKey: string,
    wordIndex: number,
    updates: { understanding?: boolean; speaking?: boolean; firstSpokenAge?: number | null }
  ): Promise<void> {
    console.log('updateWordStatus called:', { childId, language, categoryKey, wordIndex, updates });

    if (!this.data || !this.data.children[childId]) {
      console.error('updateWordStatus: Child not found:', childId);
      throw new Error('Child not found');
    }

    const child = this.data.children[childId];
    const category = child.categories[language]?.[categoryKey];

    if (!category) {
      console.error('updateWordStatus: Category not found:', { language, categoryKey });
      console.error('Available categories:', Object.keys(child.categories[language] || {}));
      throw new Error(`Category '${categoryKey}' not found in language '${language}'`);
    }

    const word = category.words[wordIndex];
    if (!word) {
      console.error('updateWordStatus: Word not found at index:', wordIndex, 'Category has', category.words.length, 'words');
      throw new Error(`Word not found at index ${wordIndex} in category '${categoryKey}'`);
    }

    console.log('updateWordStatus: Updating word:', word.word);

    // Update word status
    Object.assign(word, updates);

    // If marking as speaking for the first time, record the age
    if (updates.speaking && !word.firstSpokenAge && child.birthDate) {
      const ageInMonths = this.calculateAgeInMonths(child.birthDate);
      word.firstSpokenAge = ageInMonths;
    }

    child.lastModified = new Date().toISOString();
    await this.saveData();
  }

  async addCustomWord(
    childId: string,
    language: 'english' | 'portuguese' | 'spanish',
    categoryKey: string,
    wordText: string
  ): Promise<void> {
    if (!this.data || !this.data.children[childId]) {
      throw new Error('Child not found');
    }

    const child = this.data.children[childId];
    const category = child.categories[language][categoryKey];

    if (!category) {
      throw new Error('Category not found');
    }

    const newWord = {
      word: wordText,
      understanding: false,
      speaking: false,
      firstSpokenAge: null,
    };

    category.words.push(newWord);
    child.lastModified = new Date().toISOString();
    await this.saveData();
  }

  async removeWord(
    childId: string,
    language: 'english' | 'portuguese' | 'spanish',
    categoryKey: string,
    wordIndex: number
  ): Promise<void> {
    console.log('removeWord called:', { childId, language, categoryKey, wordIndex });

    if (!this.data || !this.data.children[childId]) {
      console.error('removeWord: Child not found:', childId);
      throw new Error('Child not found');
    }

    const child = this.data.children[childId];
    const category = child.categories[language]?.[categoryKey];

    if (!category) {
      console.error('removeWord: Category not found:', { language, categoryKey });
      console.error('Available categories:', Object.keys(child.categories[language] || {}));
      throw new Error(`Category '${categoryKey}' not found in language '${language}'`);
    }

    const wordToRemove = category.words[wordIndex];
    if (!wordToRemove) {
      console.error('removeWord: Word not found at index:', wordIndex, 'Category has', category.words.length, 'words');
      throw new Error(`Word not found at index ${wordIndex} in category '${categoryKey}'`);
    }

    console.log('removeWord: Removing word:', wordToRemove.word, 'from category:', categoryKey);
    category.words.splice(wordIndex, 1);
    console.log('removeWord: Word removed, category now has', category.words.length, 'words');

    child.lastModified = new Date().toISOString();
    await this.saveData();
    console.log('removeWord: Data saved successfully');
  }

  calculateAgeInMonths(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();

    const yearDiff = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    let totalMonths = yearDiff * 12 + monthDiff;

    // Adjust if the day hasn't occurred yet this month
    if (dayDiff < 0) {
      totalMonths--;
    }

    return Math.max(0, totalMonths);
  }

  async exportData(): Promise<string> {
    if (!this.data) {
      await this.initializeData();
    }

    return JSON.stringify(this.data, null, 2);
  }

  private async migrateData(data: AppData): Promise<AppData> {
    // Add migration logic here when app structure changes
    // For now, just ensure version is set
    if (!data.version) {
      data.version = STORAGE_VERSION;
    }

    return data;
  }

  async getAllData(): Promise<AppData> {
    if (!this.data) {
      await this.initializeData();
    }
    return this.data!;
  }

  async importData(importedData: AppData): Promise<void> {
    try {
      this.data = await this.migrateData(importedData);
      await this.saveData();
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }

  async removeLanguageData(childId: string, language: 'english' | 'portuguese' | 'spanish'): Promise<void> {
    if (!this.data) throw new Error('Data not initialized');

    const child = this.data.children[childId];
    if (!child) throw new Error('Child not found');

    // Remove the language data from child's categories
    if (child.categories[language]) {
      delete child.categories[language];
    }

    // Update the child's lastModified timestamp
    child.lastModified = new Date().toISOString();

    await this.saveData();
  }

  async restoreLanguageData(childId: string, language: 'english' | 'portuguese' | 'spanish'): Promise<void> {
    if (!this.data) throw new Error('Data not initialized');

    const child = this.data.children[childId];
    if (!child) throw new Error('Child not found');

    // Only restore if the language data doesn't already exist
    if (!child.categories[language]) {
      child.categories[language] = getDefaultDataForLanguage(language);
    }

    // Update the child's lastModified timestamp
    child.lastModified = new Date().toISOString();

    await this.saveData();
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      this.data = {
        children: {},
        activeChildId: null,
        version: STORAGE_VERSION,
      };
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataService = new DataService();