import { Theme } from '../types';

export const theme: Theme = {
  colors: {
    primary: '#9eb7dd',
    secondary: '#88c3a7',
    background: '#ffffff',
    surface: 'rgba(255, 255, 255, 0.9)',
    text: '#2C3E50',
    textSecondary: '#607D8B',
    border: 'rgba(255, 255, 255, 0.3)',
    success: '#88c3a7',
    warning: '#e7984d',
    error: '#FF7A85',
    english: '#9eb7dd',
    portuguese: '#e7984d',
    spanish: '#b19dd9',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
};

export const gradients = {
  background: ['#9eb7dd', '#88c3a7', '#e7984d'],
  card: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'],
  primaryCard: ['#9eb7dd', '#88c3a7'],
  successCard: ['#88c3a7', '#9eb7dd'],
  warningCard: ['#e7984d', '#88c3a7'],
  statsBar: ['#88c3a7', '#9eb7dd'],
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};