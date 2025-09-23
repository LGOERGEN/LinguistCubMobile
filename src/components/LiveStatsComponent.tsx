import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, shadows, gradients } from '../constants/theme';
import { Child } from '../types';
import { dataService } from '../services/dataService';

interface LiveStatsComponentProps {
  child: Child;
  language: 'english' | 'portuguese';
  selectedCategory?: string;
}

interface WordStats {
  understood: number;
  spoken: number;
  englishRatio: number;
  portugueseRatio: number;
  ageChartData: { age: number; english: number; portuguese: number; total: number }[];
}

interface LanguageStats {
  understood: number;
  spoken: number;
}

const LiveStatsComponent: React.FC<LiveStatsComponentProps> = ({
  child,
  language,
  selectedCategory,
}) => {
  const calculateLanguageStats = (lang: 'english' | 'portuguese'): LanguageStats => {
    const categories = child.categories[lang];
    let allWords: any[] = [];

    Object.values(categories).forEach(category => {
      allWords = allWords.concat(category.words);
    });

    return {
      understood: allWords.filter(word => word.understanding).length,
      spoken: allWords.filter(word => word.speaking).length,
    };
  };

  const calculateStats = (): WordStats => {
    const englishStats = calculateLanguageStats('english');
    const portugueseStats = calculateLanguageStats('portuguese');
    const totalSpoken = englishStats.spoken + portugueseStats.spoken;

    // Calculate language ratios
    const englishRatio = totalSpoken > 0 ? Math.round((englishStats.spoken / totalSpoken) * 100) : 50;
    const portugueseRatio = totalSpoken > 0 ? Math.round((portugueseStats.spoken / totalSpoken) * 100) : 50;

    // Calculate age chart data with stacked bars
    const ageGroups: { [key: number]: { english: number; portuguese: number } } = {};

    // Process both languages
    ['english', 'portuguese'].forEach(lang => {
      const categories = child.categories[lang as 'english' | 'portuguese'];
      Object.values(categories).forEach(category => {
        category.words.forEach(word => {
          if (word.speaking && word.firstSpokenAge !== null) {
            const age = word.firstSpokenAge;
            if (!ageGroups[age]) {
              ageGroups[age] = { english: 0, portuguese: 0 };
            }
            ageGroups[age][lang as 'english' | 'portuguese']++;
          }
        });
      });
    });

    // Convert to stacked chart data
    const ageChartData = Object.keys(ageGroups)
      .map(ageStr => {
        const age = parseInt(ageStr);
        const group = ageGroups[age];
        return {
          age,
          english: group.english,
          portuguese: group.portuguese,
          total: group.english + group.portuguese
        };
      })
      .sort((a, b) => a.age - b.age);

    return {
      understood: englishStats.understood + portugueseStats.understood,
      spoken: totalSpoken,
      englishRatio,
      portugueseRatio,
      ageChartData,
    };
  };

  const stats = calculateStats();

  const renderStatCard = (title: string, value: number, backgroundColor: string) => (
    <View style={[styles.statCard, { backgroundColor }]}>
      <Text style={[styles.statValue, { color: '#ffffff' }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: '#ffffff' }]}>{title}</Text>
    </View>
  );

  const renderLanguageRatio = () => {
    if (!child.selectedLanguages.includes('english') || !child.selectedLanguages.includes('portuguese')) {
      return null;
    }

    return (
      <View style={styles.ratioContainer}>
        <Text style={styles.ratioTitle}>Language Distribution (Spoken Words)</Text>
        <View style={styles.ratioBar}>
          <View style={[styles.ratioSegment, { width: `${stats.englishRatio}%`, backgroundColor: theme.colors.english }]}>
            <Text style={styles.ratioText}>{stats.englishRatio}%</Text>
          </View>
          <View style={[styles.ratioSegment, { width: `${stats.portugueseRatio}%`, backgroundColor: theme.colors.portuguese }]}>
            <Text style={styles.ratioText}>{stats.portugueseRatio}%</Text>
          </View>
        </View>
        <View style={styles.ratioLabels}>
          <Text style={styles.ratioLabel}>English</Text>
          <Text style={styles.ratioLabel}>Portuguese</Text>
        </View>
      </View>
    );
  };

  const renderAgeChart = () => {
    if (stats.ageChartData.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Words Spoken by Age</Text>
          <Text style={styles.noDataText}>No spoken words recorded yet</Text>
        </View>
      );
    }

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - (theme.spacing.md * 4);
    const maxCount = Math.max(...stats.ageChartData.map(d => d.total));
    const maxHeight = 60;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Words Spoken by Age</Text>
        <View style={styles.chart}>
          {stats.ageChartData.map((dataPoint, index) => {
            const englishHeight = (dataPoint.english / maxCount) * maxHeight;
            const portugueseHeight = (dataPoint.portuguese / maxCount) * maxHeight;

            return (
              <View key={`${dataPoint.age}-${index}`} style={styles.chartBar}>
                <View style={styles.stackedBar}>
                  {dataPoint.portuguese > 0 && (
                    <View style={[styles.barSegment, {
                      height: portugueseHeight,
                      backgroundColor: theme.colors.portuguese
                    }]} />
                  )}
                  {dataPoint.english > 0 && (
                    <View style={[styles.barSegment, {
                      height: englishHeight,
                      backgroundColor: theme.colors.english
                    }]} />
                  )}
                </View>
                <Text style={styles.barLabel}>{dataPoint.age}m</Text>
                <Text style={styles.barCount}>{dataPoint.total}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.english }]} />
            <Text style={styles.legendText}>English</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.portuguese }]} />
            <Text style={styles.legendText}>Portuguese</Text>
          </View>
        </View>
      </View>
    );
  };

  const getDisplayTitle = () => {
    if (child.selectedLanguages.includes('english') && child.selectedLanguages.includes('portuguese')) {
      return 'Overall Progress';
    }
    return language === 'english' ? 'English Progress' : 'Portuguese Progress';
  };

  return (
    <LinearGradient
      colors={gradients.card}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getDisplayTitle()}</Text>
        <Text style={styles.headerSubtitle}>{child.name}'s Language Development</Text>
      </View>

      <View style={styles.statsGrid}>
        {renderStatCard('Words Understanding', stats.understood, theme.colors.success)}
        {renderStatCard('Words Speaking', stats.spoken, theme.colors.primary)}
      </View>

      {renderLanguageRatio()}
      {renderAgeChart()}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
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
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    marginHorizontal: theme.spacing.xs,
    ...shadows.lg,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: theme.fontSizes.sm,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  statPercentage: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  ratioContainer: {
    marginBottom: theme.spacing.md,
  },
  ratioTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  ratioBar: {
    flexDirection: 'row',
    height: 30,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  ratioSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratioText: {
    color: '#ffffff',
    fontSize: theme.fontSizes.xs,
    fontWeight: 'bold',
  },
  ratioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: theme.spacing.sm,
  },
  chartTitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  chartBar: {
    alignItems: 'center',
    minWidth: 30,
  },
  stackedBar: {
    width: 20,
    minHeight: 2,
    marginBottom: theme.spacing.xs,
    justifyContent: 'flex-end',
  },
  barSegment: {
    width: 20,
    minHeight: 2,
  },
  barLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  barCount: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text,
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  noDataText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: theme.spacing.lg,
  },
});

export default LiveStatsComponent;