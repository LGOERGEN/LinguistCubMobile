import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, shadows } from '../constants/theme';
import { Child } from '../types';

interface LiveStatsComponentProps {
  child: Child;
  language: 'english' | 'portuguese';
  selectedCategory?: string;
}

interface WordStats {
  total: number;
  understanding: number;
  speaking: number;
  understandingPercentage: number;
  speakingPercentage: number;
}

const LiveStatsComponent: React.FC<LiveStatsComponentProps> = ({
  child,
  language,
  selectedCategory,
}) => {
  const calculateStats = (): WordStats => {
    const categories = child.categories[language];
    let allWords: any[] = [];

    if (selectedCategory === 'all' || !selectedCategory) {
      Object.values(categories).forEach(category => {
        allWords = allWords.concat(category.words);
      });
    } else if (selectedCategory === 'other') {
      if (categories.other) {
        allWords = categories.other.words;
      }
    } else {
      if (categories[selectedCategory]) {
        allWords = categories[selectedCategory].words;
      }
    }

    const total = allWords.length;
    const understanding = allWords.filter(word => word.understanding).length;
    const speaking = allWords.filter(word => word.speaking).length;

    return {
      total,
      understanding,
      speaking,
      understandingPercentage: total > 0 ? Math.round((understanding / total) * 100) : 0,
      speakingPercentage: total > 0 ? Math.round((speaking / total) * 100) : 0,
    };
  };

  const stats = calculateStats();

  const renderStatCard = (title: string, value: number, percentage?: number, color?: string) => (
    <View style={[styles.statCard, color && { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      {percentage !== undefined && (
        <Text style={styles.statPercentage}>{percentage}%</Text>
      )}
    </View>
  );

  const getCategoryTitle = () => {
    if (!selectedCategory || selectedCategory === 'all') {
      return 'All Categories';
    }
    if (selectedCategory === 'other') {
      return 'Custom Words';
    }
    return child.categories[language][selectedCategory]?.title || selectedCategory;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'english' ? '🇬🇧' : '🇧🇷'} {getCategoryTitle()}
        </Text>
        <Text style={styles.headerSubtitle}>Live Progress for {child.name}</Text>
      </View>

      <View style={styles.statsGrid}>
        {renderStatCard('Total Words', stats.total, undefined, theme.colors.primary)}
        {renderStatCard('Understanding', stats.understanding, stats.understandingPercentage, theme.colors.success)}
        {renderStatCard('Speaking', stats.speaking, stats.speakingPercentage, theme.colors.english)}
      </View>

      <View style={styles.progressBars}>
        <View style={styles.progressBar}>
          <Text style={styles.progressLabel}>Understanding Progress</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${stats.understandingPercentage}%`,
                  backgroundColor: theme.colors.success
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{stats.understandingPercentage}%</Text>
        </View>

        <View style={styles.progressBar}>
          <Text style={styles.progressLabel}>Speaking Progress</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${stats.speakingPercentage}%`,
                  backgroundColor: theme.colors.english
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{stats.speakingPercentage}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...shadows.md,
  },
  header: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
  },
  statTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statPercentage: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  progressBars: {
    gap: theme.spacing.md,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
    width: 80,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
});

export default LiveStatsComponent;