import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Word } from '../types';
import { theme, shadows } from '../constants/theme';

interface WordCardProps {
  word: Word;
  onToggleUnderstanding: () => void;
  onToggleSpeaking: () => void;
}

const WordCard: React.FC<WordCardProps> = ({
  word,
  onToggleUnderstanding,
  onToggleSpeaking,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.wordText}>{word.word}</Text>

      <View style={styles.togglesContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.understandingButton,
            word.understanding && styles.activeUnderstanding,
          ]}
          onPress={onToggleUnderstanding}
        >
          <Text
            style={[
              styles.toggleText,
              word.understanding && styles.activeText,
            ]}
          >
            👂 Understands
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            styles.speakingButton,
            word.speaking && styles.activeSpeaking,
          ]}
          onPress={onToggleSpeaking}
        >
          <Text
            style={[
              styles.toggleText,
              word.speaking && styles.activeText,
            ]}
          >
            💬 Says
          </Text>
        </TouchableOpacity>
      </View>

      {word.firstSpokenAge && (
        <Text style={styles.ageText}>
          First said at {word.firstSpokenAge} months
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...shadows.sm,
  },
  wordText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  togglesContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  understandingButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  speakingButton: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.background,
  },
  activeUnderstanding: {
    backgroundColor: theme.colors.primary,
  },
  activeSpeaking: {
    backgroundColor: theme.colors.success,
  },
  toggleText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  activeText: {
    color: '#ffffff',
  },
  ageText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
});

export default WordCard;