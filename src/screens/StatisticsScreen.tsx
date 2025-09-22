import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { theme, shadows } from '../constants/theme';
import { dataService } from '../services/dataService';
import { Child } from '../types';

interface CategoryStats {
  categoryKey: string;
  title: string;
  understanding: number;
  speaking: number;
  total: number;
  percentage: number;
}

interface LanguageStats {
  language: 'english' | 'portuguese';
  understanding: number;
  speaking: number;
  total: number;
  categories: CategoryStats[];
}

const StatisticsScreen: React.FC = () => {
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [stats, setStats] = useState<{
    english: LanguageStats;
    portuguese: LanguageStats;
  } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadStatistics();
    }, [])
  );

  const loadStatistics = () => {
    const child = dataService.getActiveChild();
    if (!child) {
      setActiveChild(null);
      setStats(null);
      return;
    }

    setActiveChild(child);

    const englishStats = calculateLanguageStats(child, 'english');
    const portugueseStats = calculateLanguageStats(child, 'portuguese');

    setStats({
      english: englishStats,
      portuguese: portugueseStats,
    });
  };

  const calculateLanguageStats = (child: Child, language: 'english' | 'portuguese'): LanguageStats => {
    const categories = child.categories[language] || {};
    const categoryStats: CategoryStats[] = [];

    let totalUnderstanding = 0;
    let totalSpeaking = 0;
    let totalWords = 0;

    Object.entries(categories).forEach(([categoryKey, categoryData]) => {
      const understanding = categoryData.words.filter(w => w.understanding).length;
      const speaking = categoryData.words.filter(w => w.speaking).length;
      const total = categoryData.words.length;

      categoryStats.push({
        categoryKey,
        title: categoryData.title,
        understanding,
        speaking,
        total,
        percentage: total > 0 ? Math.round((speaking / total) * 100) : 0,
      });

      totalUnderstanding += understanding;
      totalSpeaking += speaking;
      totalWords += total;
    });

    return {
      language,
      understanding: totalUnderstanding,
      speaking: totalSpeaking,
      total: totalWords,
      categories: categoryStats.sort((a, b) => b.percentage - a.percentage),
    };
  };

  const renderProgressBar = (value: number, total: number, color: string) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: color }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(percentage)}%</Text>
      </View>
    );
  };

  const renderLanguageCard = (languageStats: LanguageStats) => {
    const flag = languageStats.language === 'english' ? '🇬🇧' : '🇧🇷';
    const languageName = languageStats.language === 'english' ? 'English' : 'Portuguese';

    return (
      <View key={languageStats.language} style={styles.languageCard}>
        <Text style={styles.languageTitle}>
          {flag} {languageName}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{languageStats.understanding}</Text>
            <Text style={styles.statLabel}>Understands</Text>
            {renderProgressBar(
              languageStats.understanding,
              languageStats.total,
              theme.colors.primary
            )}
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{languageStats.speaking}</Text>
            <Text style={styles.statLabel}>Says</Text>
            {renderProgressBar(
              languageStats.speaking,
              languageStats.total,
              theme.colors.success
            )}
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{languageStats.total}</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Categories Progress</Text>
          {languageStats.categories.map((category) => (
            <View key={category.categoryKey} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.title}</Text>
                <Text style={styles.categoryNumbers}>
                  {category.speaking}/{category.total} words
                </Text>
              </View>
              {renderProgressBar(
                category.speaking,
                category.total,
                theme.colors.success
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!activeChild) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noChildText}>
          No active child selected
        </Text>
        <Text style={styles.noChildSubtext}>
          Please select a child from the home screen to view statistics
        </Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  const totalUnderstanding = stats.english.understanding + stats.portuguese.understanding;
  const totalSpeaking = stats.english.speaking + stats.portuguese.speaking;
  const totalWords = stats.english.total + stats.portuguese.total;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeChild.name}'s Progress</Text>
        <Text style={styles.subtitle}>Language development statistics</Text>
      </View>

      <View style={styles.overallStats}>
        <Text style={styles.overallTitle}>Overall Progress</Text>
        <View style={styles.overallRow}>
          <View style={styles.overallStat}>
            <Text style={styles.overallNumber}>{totalSpeaking}</Text>
            <Text style={styles.overallLabel}>Words Speaking</Text>
          </View>
          <View style={styles.overallStat}>
            <Text style={styles.overallNumber}>{totalUnderstanding}</Text>
            <Text style={styles.overallLabel}>Words Understanding</Text>
          </View>
          <View style={styles.overallStat}>
            <Text style={styles.overallNumber}>{totalWords}</Text>
            <Text style={styles.overallLabel}>Total Words</Text>
          </View>
        </View>
      </View>

      {renderLanguageCard(stats.english)}
      {renderLanguageCard(stats.portuguese)}
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
    padding: theme.spacing.xl,
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
  noChildText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  noChildSubtext: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
  },
  overallStats: {
    margin: theme.spacing.md,
    marginTop: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...shadows.md,
  },
  overallTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overallStat: {
    alignItems: 'center',
  },
  overallNumber: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  overallLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  languageCard: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    ...shadows.md,
  },
  languageTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  statNumber: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  progressBarContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  categoriesSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  categoriesTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  categoryInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  categoryName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  categoryNumbers: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
});

export default StatisticsScreen;