import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

import { theme, shadows, gradients } from '../constants/theme';
import { Child } from '../types';
import { dataService } from '../services/dataService';

interface SocialMediaShareProps {
  child: Child;
}

const SocialMediaShare: React.FC<SocialMediaShareProps> = ({ child }) => {
  const screenWidth = Dimensions.get('window').width;

  // Calculate language statistics
  const calculateLanguageStats = () => {
    const stats = child.selectedLanguages.map(language => {
      const categories = child.categories[language];
      let totalUnderstood = 0;
      let totalSpoken = 0;

      Object.values(categories).forEach(category => {
        totalUnderstood += category.words.filter(word => word.understanding).length;
        totalSpoken += category.words.filter(word => word.speaking).length;
      });

      return {
        language,
        totalUnderstood,
        totalSpoken,
        percentage: 0 // Will calculate after we get total
      };
    });

    const totalSpoken = stats.reduce((sum, stat) => sum + stat.totalSpoken, 0);

    // Calculate percentages
    stats.forEach(stat => {
      stat.percentage = totalSpoken > 0 ? Math.round((stat.totalSpoken / totalSpoken) * 100) : 0;
    });

    return {
      languageStats: stats,
      totalUnderstood: stats.reduce((sum, stat) => sum + stat.totalUnderstood, 0),
      totalSpoken
    };
  };

  const formatAge = (ageInMonths: number | null): string => {
    if (!ageInMonths) return 'Age not specified';
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    if (years > 0) {
      return `${years}y ${months}m`;
    }
    return `${months}m`;
  };

  const getLanguageColor = (lang: 'english' | 'portuguese' | 'spanish'): string => {
    switch (lang) {
      case 'english': return theme.colors.english;
      case 'portuguese': return theme.colors.portuguese;
      case 'spanish': return theme.colors.spanish;
      default: return theme.colors.primary;
    }
  };

  const getLanguageName = (lang: 'english' | 'portuguese' | 'spanish'): string => {
    switch (lang) {
      case 'english': return 'English';
      case 'portuguese': return 'Portuguese';
      case 'spanish': return 'Spanish';
      default: return lang;
    }
  };

  const childAge = child.birthDate ? dataService.calculateAgeInMonths(child.birthDate) : null;
  const { languageStats, totalUnderstood, totalSpoken } = calculateLanguageStats();

  return (
    <LinearGradient
      colors={['#87CEEB', '#B0E0E6', '#ADD8E6', '#87CEFA', '#B0C4DE']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.card}>
        {/* Header */}
        <LinearGradient
          colors={['#87CEEB', '#B0E0E6', '#ADD8E6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🐻</Text>
            </View>
            <View>
              <Text style={styles.logo}>Linguist Cub</Text>
              <Text style={styles.tagline}>Language Progress Report</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Child Info */}
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
          style={styles.childInfo}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childAge}>Age: {formatAge(childAge)}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}</Text>
        </LinearGradient>

        {/* Main Stats */}
        <View style={styles.mainStats}>
          <LinearGradient
            colors={['#87CEEB', '#B0E0E6']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statNumber}>{totalUnderstood}</Text>
            <Text style={styles.statLabel}>Words Understanding</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#B0C4DE', '#87CEFA']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statNumber}>{totalSpoken}</Text>
            <Text style={styles.statLabel}>Words Speaking</Text>
          </LinearGradient>
        </View>

        {/* Language Distribution */}
        {languageStats.length > 1 && totalSpoken > 0 && (
          <View style={styles.languageSection}>
            <Text style={styles.sectionTitle}>Language Distribution</Text>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              {languageStats.map((stat, index) => {
                const color = getLanguageColor(stat.language);
                const width = (stat.percentage / 100) * 100;

                return (
                  <View
                    key={stat.language}
                    style={[
                      styles.progressSegment,
                      {
                        width: `${width}%`,
                        backgroundColor: color
                      }
                    ]}
                  >
                    {stat.percentage > 10 && (
                      <Text style={styles.progressText}>{stat.percentage}%</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Language Labels */}
            <View style={styles.languageLabels}>
              {languageStats.map((stat) => (
                <View key={stat.language} style={styles.languageLabel}>
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: getLanguageColor(stat.language) }
                    ]}
                  />
                  <Text style={styles.labelText}>
                    {getLanguageName(stat.language)} ({stat.totalSpoken})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Every sound and babble from {child.name} counts! 🥰
          </Text>
          <Text style={styles.appCredit}>Generated by Linguist Cub</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 600,
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    ...shadows.lg,
  },
  header: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 1,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  childInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    ...shadows.md,
  },
  childName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  childAge: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  mainStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...shadows.md,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  languageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    flexDirection: 'row',
    height: 32,
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...shadows.sm,
  },
  progressSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  languageLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  languageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  appCredit: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default SocialMediaShare;

// Function to generate social media post image
export const generateSocialMediaPost = async (child: Child): Promise<string> => {
  try {
    // Generate HTML content
    const htmlContent = generateSocialMediaHTML(child);

    // Convert HTML to image using expo-print (optimized for Instagram stories)
    const { uri: pdfUri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      width: 400,
      height: 711, // 9:16 aspect ratio for Instagram stories
      format: 'a4',
      orientation: 'portrait',
    });

    // Return the PDF URI directly - expo-print generates a file that can be shared
    // Social media platforms will handle this appropriately for image sharing
    return pdfUri;
  } catch (error) {
    console.error('Error generating social media post:', error);
    throw error;
  }
};

// Function to generate social media image HTML
export const generateSocialMediaHTML = (child: Child): string => {
  const childAge = child.birthDate ? dataService.calculateAgeInMonths(child.birthDate) : null;

  const calculateLanguageStats = () => {
    const stats = child.selectedLanguages.map(language => {
      const categories = child.categories[language];
      let totalUnderstood = 0;
      let totalSpoken = 0;

      Object.values(categories).forEach(category => {
        totalUnderstood += category.words.filter(word => word.understanding).length;
        totalSpoken += category.words.filter(word => word.speaking).length;
      });

      return {
        language,
        totalUnderstood,
        totalSpoken,
        percentage: 0
      };
    });

    const totalSpoken = stats.reduce((sum, stat) => sum + stat.totalSpoken, 0);

    stats.forEach(stat => {
      stat.percentage = totalSpoken > 0 ? Math.round((stat.totalSpoken / totalSpoken) * 100) : 0;
    });

    return {
      languageStats: stats,
      totalUnderstood: stats.reduce((sum, stat) => sum + stat.totalUnderstood, 0),
      totalSpoken
    };
  };

  const formatAge = (ageInMonths: number | null): string => {
    if (!ageInMonths) return 'Age not specified';
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    if (years > 0) {
      return `${years}y ${months}m`;
    }
    return `${months}m`;
  };

  const getLanguageColor = (lang: 'english' | 'portuguese' | 'spanish'): string => {
    switch (lang) {
      case 'english': return '#9eb7dd';
      case 'portuguese': return '#e7984d';
      case 'spanish': return '#b19dd9';
      default: return '#9eb7dd';
    }
  };

  const getLanguageName = (lang: 'english' | 'portuguese' | 'spanish'): string => {
    switch (lang) {
      case 'english': return 'English';
      case 'portuguese': return 'Portuguese';
      case 'spanish': return 'Spanish';
      default: return lang;
    }
  };

  const { languageStats, totalUnderstood, totalSpoken } = calculateLanguageStats();

  const generateProgressBar = (): string => {
    if (languageStats.length < 2 || totalSpoken === 0) return '';

    let progressHTML = '<div class="progress-bar">';

    languageStats.forEach(stat => {
      const color = getLanguageColor(stat.language);
      const width = stat.percentage;

      progressHTML += `
        <div class="progress-segment" style="width: ${width}%; background-color: ${color};">
          ${stat.percentage > 10 ? `<span class="progress-text">${stat.percentage}%</span>` : ''}
        </div>
      `;
    });

    progressHTML += '</div>';

    let labelsHTML = '<div class="language-labels">';
    languageStats.forEach(stat => {
      const color = getLanguageColor(stat.language);
      const name = getLanguageName(stat.language);

      labelsHTML += `
        <div class="language-label">
          <div class="color-dot" style="background-color: ${color};"></div>
          <span class="label-text">${name} (${stat.totalSpoken})</span>
        </div>
      `;
    });
    labelsHTML += '</div>';

    return `
      <div class="language-section">
        <h3 class="section-title">Language Distribution</h3>
        ${progressHTML}
        ${labelsHTML}
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${child.name}'s Language Progress</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 25%, #ADD8E6 50%, #87CEFA 75%, #B0C4DE 100%);
      padding: 20px;
      width: 400px;
      height: 711px; /* 9:16 aspect ratio for Instagram stories */
    }

    .container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(135, 206, 235, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
    }

    .header {
      background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #ADD8E6 100%);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: shimmer 3s infinite;
    }

    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }

    .brand-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      position: relative;
      z-index: 2;
    }

    .logo-container {
      width: 50px;
      height: 50px;
      background: rgba(255,255,255,0.2);
      border-radius: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 1px;
      font-style: italic;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .tagline {
      font-size: 12px;
      opacity: 0.9;
      font-weight: 500;
      margin-top: 2px;
    }

    .child-info {
      background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8));
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .child-name {
      font-size: 28px;
      font-weight: bold;
      color: #2C3E50;
      margin-bottom: 4px;
    }

    .child-age {
      font-size: 16px;
      color: #607D8B;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .date {
      font-size: 14px;
      color: #607D8B;
      font-weight: 500;
    }

    .main-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      flex: 1;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      color: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: rotate 4s linear infinite;
    }

    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .stat-card.understanding {
      background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
    }

    .stat-card.speaking {
      background: linear-gradient(135deg, #B0C4DE 0%, #87CEFA 100%);
    }

    .stat-number {
      font-size: 32px;
      font-weight: 900;
      margin-bottom: 4px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      position: relative;
      z-index: 2;
    }

    .stat-label {
      font-size: 12px;
      opacity: 0.9;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 2;
    }

    .language-section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #2C3E50;
      margin-bottom: 12px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-bar {
      display: flex;
      height: 32px;
      background: #e9ecef;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .progress-segment {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .progress-text {
      color: white;
      font-size: 12px;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }

    .language-labels {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .language-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 6px;
    }

    .label-text {
      font-size: 14px;
      color: #2C3E50;
      font-weight: 600;
    }

    .footer {
      margin-top: auto;
      text-align: center;
      padding-top: 20px;
    }

    .footer-text {
      font-size: 16px;
      color: #2C3E50;
      font-weight: 600;
      font-style: italic;
      margin-bottom: 8px;
    }

    .app-credit {
      font-size: 12px;
      color: #607D8B;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-section">
        <div class="logo-container">🐻</div>
        <div>
          <div class="logo">Linguist Cub</div>
          <div class="tagline">Language Progress Report</div>
        </div>
      </div>
    </div>

    <div class="child-info">
      <div class="child-name">${child.name}</div>
      <div class="child-age">Age: ${formatAge(childAge)}</div>
      <div class="date">${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}</div>
    </div>

    <div class="main-stats">
      <div class="stat-card understanding">
        <div class="stat-number">${totalUnderstood}</div>
        <div class="stat-label">Words Understanding</div>
      </div>
      <div class="stat-card speaking">
        <div class="stat-number">${totalSpoken}</div>
        <div class="stat-label">Words Speaking</div>
      </div>
    </div>

    ${generateProgressBar()}

    <div class="footer">
      <div class="footer-text">Every sound and babble from ${child.name} counts! 🥰</div>
      <div class="app-credit">Generated by Linguist Cub</div>
    </div>
  </div>
</body>
</html>
  `;
};