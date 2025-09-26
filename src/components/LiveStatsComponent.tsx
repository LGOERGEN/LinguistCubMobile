import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, shadows, gradients } from '../constants/theme';
import { Child } from '../types';
import { dataService } from '../services/dataService';

interface LiveStatsComponentProps {
  child: Child;
  language: 'english' | 'portuguese' | 'spanish';
  selectedCategory?: string;
}

interface WordStats {
  understood: number;
  spoken: number;
  englishRatio: number;
  portugueseRatio: number;
  spanishRatio: number;
  ageChartData: { age: number; english: number; portuguese: number; spanish: number; total: number }[];
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
  const calculateLanguageStats = (lang: 'english' | 'portuguese' | 'spanish'): LanguageStats => {
    const categories = child.categories[lang];
    let allWords: any[] = [];

    if (categories) {
      Object.values(categories).forEach(category => {
        allWords = allWords.concat(category.words);
      });
    }

    return {
      understood: allWords.filter(word => word.understanding).length,
      spoken: allWords.filter(word => word.speaking).length,
    };
  };

  const calculateStats = (): WordStats => {
    const englishStats = calculateLanguageStats('english');
    const portugueseStats = calculateLanguageStats('portuguese');
    const spanishStats = calculateLanguageStats('spanish');
    const totalSpoken = englishStats.spoken + portugueseStats.spoken + spanishStats.spoken;

    // Calculate language ratios
    const englishRatio = totalSpoken > 0 ? Math.round((englishStats.spoken / totalSpoken) * 100) : 33;
    const portugueseRatio = totalSpoken > 0 ? Math.round((portugueseStats.spoken / totalSpoken) * 100) : 33;
    const spanishRatio = totalSpoken > 0 ? Math.round((spanishStats.spoken / totalSpoken) * 100) : 34;

    // Calculate age chart data with stacked bars
    const ageGroups: { [key: number]: { english: number; portuguese: number; spanish: number } } = {};

    // Process all three languages
    ['english', 'portuguese', 'spanish'].forEach(lang => {
      const categories = child.categories[lang as 'english' | 'portuguese' | 'spanish'];
      if (categories) {
        Object.values(categories).forEach(category => {
          category.words.forEach(word => {
            if (word.speaking && word.firstSpokenAge !== null) {
              const age = word.firstSpokenAge;
              if (!ageGroups[age]) {
                ageGroups[age] = { english: 0, portuguese: 0, spanish: 0 };
              }
              ageGroups[age][lang as 'english' | 'portuguese' | 'spanish']++;
            }
          });
        });
      }
    });

    // Convert to cumulative stacked chart data with filled gaps
    const sortedAges = Object.keys(ageGroups)
      .map(ageStr => parseInt(ageStr))
      .sort((a, b) => a - b);

    if (sortedAges.length === 0) {
      return {
        understood: englishStats.understood + portugueseStats.understood + spanishStats.understood,
        spoken: totalSpoken,
        englishRatio,
        portugueseRatio,
        spanishRatio,
        ageChartData: [],
      };
    }

    // Create continuous range from min to max age
    const minAge = Math.min(...sortedAges);
    const maxAge = Math.max(...sortedAges);
    const allAges = [];
    for (let age = minAge; age <= maxAge; age++) {
      allAges.push(age);
    }

    let cumulativeEnglish = 0;
    let cumulativePortuguese = 0;
    let cumulativeSpanish = 0;

    const ageChartData = allAges.map(age => {
      // Add words for this age if they exist
      if (ageGroups[age]) {
        const group = ageGroups[age];
        cumulativeEnglish += group.english;
        cumulativePortuguese += group.portuguese;
        cumulativeSpanish += group.spanish;
      }
      // If no words for this age, cumulative values stay the same (carry forward)

      return {
        age,
        english: cumulativeEnglish,
        portuguese: cumulativePortuguese,
        spanish: cumulativeSpanish,
        total: cumulativeEnglish + cumulativePortuguese + cumulativeSpanish
      };
    });

    return {
      understood: englishStats.understood + portugueseStats.understood + spanishStats.understood,
      spoken: totalSpoken,
      englishRatio,
      portugueseRatio,
      spanishRatio,
      ageChartData,
    };
  };

  const stats = calculateStats();

  const renderStatCard = (topText: string, value: number, bottomText: string, backgroundColor: string) => (
    <View style={[styles.statCard, { backgroundColor }]}>
      <Text style={[styles.statTopText, { color: '#ffffff' }]}>{topText}</Text>
      <Text style={[styles.statValue, { color: '#ffffff' }]}>{value}</Text>
      <Text style={[styles.statBottomText, { color: '#ffffff' }]}>{bottomText}</Text>
    </View>
  );

  const renderLanguageRatio = () => {
    const selectedLanguages = child.selectedLanguages;
    if (selectedLanguages.length < 2) {
      return null;
    }

    const hasSpokenWords = stats.spoken > 0;

    return (
      <View style={styles.ratioContainer}>
        <Text style={styles.ratioTitle}>Language Distribution (Spoken Words)</Text>
        <View style={styles.ratioBar}>
          {hasSpokenWords ? (
            <>
              {selectedLanguages.includes('english') && stats.englishRatio > 0 && (
                <View style={[styles.ratioSegment, { width: `${stats.englishRatio}%`, backgroundColor: theme.colors.english }]}>
                  <Text style={styles.ratioText}>{stats.englishRatio}%</Text>
                </View>
              )}
              {selectedLanguages.includes('portuguese') && stats.portugueseRatio > 0 && (
                <View style={[styles.ratioSegment, { width: `${stats.portugueseRatio}%`, backgroundColor: theme.colors.portuguese }]}>
                  <Text style={styles.ratioText}>{stats.portugueseRatio}%</Text>
                </View>
              )}
              {selectedLanguages.includes('spanish') && stats.spanishRatio > 0 && (
                <View style={[styles.ratioSegment, { width: `${stats.spanishRatio}%`, backgroundColor: theme.colors.spanish }]}>
                  <Text style={styles.ratioText}>{stats.spanishRatio}%</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyRatioBar}>
              <Text style={styles.emptyRatioText}>No words spoken yet</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderAgeChart = () => {
    if (stats.ageChartData.length === 0) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Words Spoken Over Time</Text>
          <Text style={styles.noDataText}>No spoken words recorded yet</Text>
        </View>
      );
    }

    // Determine which languages have data in the chart
    const hasEnglishData = stats.ageChartData.some(d => d.english > 0);
    const hasPortugueseData = stats.ageChartData.some(d => d.portuguese > 0);
    const hasSpanishData = stats.ageChartData.some(d => d.spanish > 0);

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - (theme.spacing.md * 4);
    const maxCount = Math.max(...stats.ageChartData.map(d => d.total));
    const maxHeight = 60;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Words Spoken Over Time</Text>
        <View style={styles.chart}>
          {stats.ageChartData.map((dataPoint, index) => {
            const totalHeight = (dataPoint.total / maxCount) * maxHeight;

            // Calculate proportional heights for stacking
            const englishPortion = dataPoint.total > 0 ? dataPoint.english / dataPoint.total : 0;
            const portuguesePortion = dataPoint.total > 0 ? dataPoint.portuguese / dataPoint.total : 0;
            const spanishPortion = dataPoint.total > 0 ? dataPoint.spanish / dataPoint.total : 0;

            const englishHeight = totalHeight * englishPortion;
            const portugueseHeight = totalHeight * portuguesePortion;
            const spanishHeight = totalHeight * spanishPortion;

            return (
              <View key={`${dataPoint.age}-${index}`} style={styles.chartBar}>
                <View style={[styles.stackedBar, { height: totalHeight }]}>
                  {dataPoint.english > 0 && (
                    <View style={[styles.barSegment, {
                      height: englishHeight,
                      backgroundColor: theme.colors.english
                    }]} />
                  )}
                  {dataPoint.portuguese > 0 && (
                    <View style={[styles.barSegment, {
                      height: portugueseHeight,
                      backgroundColor: theme.colors.portuguese
                    }]} />
                  )}
                  {dataPoint.spanish > 0 && (
                    <View style={[styles.barSegment, {
                      height: spanishHeight,
                      backgroundColor: theme.colors.spanish
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
          {child.selectedLanguages.includes('english') && hasEnglishData && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.english }]} />
              <Text style={styles.legendText}>English</Text>
            </View>
          )}
          {child.selectedLanguages.includes('portuguese') && hasPortugueseData && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.portuguese }]} />
              <Text style={styles.legendText}>Portuguese</Text>
            </View>
          )}
          {child.selectedLanguages.includes('spanish') && hasSpanishData && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.spanish }]} />
              <Text style={styles.legendText}>Spanish</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const getDisplayTitle = () => {
    return `${child.name}'s Language Development`;
  };

  return (
    <LinearGradient
      colors={gradients.card}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getDisplayTitle()}</Text>
      </View>

      <View style={styles.statsGrid}>
        {renderStatCard('Understands', stats.understood, `word${stats.understood !== 1 ? 's' : ''}`, '#88c3a7', '◇')}
        {renderStatCard('Speaks', stats.spoken, `word${stats.spoken !== 1 ? 's' : ''}`, '#88c3a7', '○')}
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
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    marginHorizontal: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#88c3a7',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  iconContainer: {
    marginRight: theme.spacing.xs,
  },
  icon: {
    fontSize: theme.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
  },
  statTopText: {
    fontSize: theme.fontSizes.sm,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  statBottomText: {
    fontSize: theme.fontSizes.sm,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
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
  emptyRatioBar: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  emptyRatioText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default LiveStatsComponent;