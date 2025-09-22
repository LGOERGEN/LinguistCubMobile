// Core data types for Linguist Cub

export interface Word {
  word: string;
  understanding: boolean;
  speaking: boolean;
  firstSpokenAge: number | null;
}

export interface Category {
  title: string;
  language: 'english' | 'portuguese';
  words: Word[];
}

export interface CategoryMap {
  [categoryKey: string]: Category;
}

export interface LanguageData {
  english: CategoryMap;
  portuguese: CategoryMap;
}

export interface Child {
  id: string;
  name: string;
  birthDate: string | null;
  selectedLanguages: ('english' | 'portuguese')[];
  categories: LanguageData;
  createdAt: string;
  lastModified: string;
}

export interface AppData {
  children: { [childId: string]: Child };
  activeChildId: string | null;
  version: string;
  lastBackup?: string;
}

// UI and Navigation types
export type RootStackParamList = {
  Home: undefined;
  ChildProfile: { childId: string };
  Categories: { language: 'english' | 'portuguese' };
  CategoryDetail: {
    language: 'english' | 'portuguese';
    categoryKey: string;
  };
  Statistics: undefined;
  Settings: undefined;
  AddWord: {
    language: 'english' | 'portuguese';
    categoryKey: string;
  };
};

export type FilterType = 'all' | 'speaking' | 'understanding';

export interface Statistics {
  totalSpeaking: number;
  totalUnderstanding: number;
  englishWords: number;
  portugueseWords: number;
  englishPercentage: number;
  portuguesePercentage: number;
  totalWords: number;
  categoryBreakdown: {
    [categoryKey: string]: {
      understanding: number;
      speaking: number;
      total: number;
    };
  };
}

// Theme and styling
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    english: string;
    portuguese: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}