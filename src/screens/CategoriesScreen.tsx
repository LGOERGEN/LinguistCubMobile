import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList } from '../types';
import { theme } from '../constants/theme';

type Props = StackScreenProps<RootStackParamList, 'Categories'>;

const CategoriesScreen: React.FC<Props> = ({ route }) => {
  const { language } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {language === 'english' ? '🇬🇧 English Categories' : '🇧🇷 Portuguese Categories'}
      </Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default CategoriesScreen;