import { Child } from '../types';
import { dataService } from '../services/dataService';

interface LanguageStats {
  language: 'english' | 'portuguese' | 'spanish';
  totalUnderstood: number;
  totalSpoken: number;
  categories: { [key: string]: { understood: number; spoken: number; words: string[] } };
}

export const generateHTMLReport = (activeChild: Child): string => {
  const currentDate = new Date();
  const childAge = activeChild.birthDate ?
    dataService.calculateAgeInMonths(activeChild.birthDate) : null;

  // Calculate word statistics for each language
  const languageStats: LanguageStats[] = activeChild.selectedLanguages.map(language => {
    const categories = activeChild.categories[language];
    const allWords: any[] = [];
    const categoryBreakdown: { [key: string]: { understood: number; spoken: number; words: string[] } } = {};

    Object.entries(categories).forEach(([categoryKey, category]) => {
      const understoodWords = category.words.filter(word => word.understanding);
      const spokenWords = category.words.filter(word => word.speaking);

      categoryBreakdown[categoryKey] = {
        understood: understoodWords.length,
        spoken: spokenWords.length,
        words: spokenWords.map(word => word.word)
      };

      allWords.push(...category.words);
    });

    const totalUnderstood = allWords.filter(word => word.understanding).length;
    const totalSpoken = allWords.filter(word => word.speaking).length;

    return {
      language,
      totalUnderstood,
      totalSpoken,
      categories: categoryBreakdown
    };
  });

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const totalUnderstood = languageStats.reduce((sum, lang) => sum + lang.totalUnderstood, 0);
  const totalSpoken = languageStats.reduce((sum, lang) => sum + lang.totalSpoken, 0);

  const getLanguageColor = (lang: 'english' | 'portuguese' | 'spanish'): string => {
    switch (lang) {
      case 'english': return '#9eb7dd';
      case 'portuguese': return '#e7984d';
      case 'spanish': return '#b19dd9';
      default: return '#95A5A6';
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

  // Calculate cumulative age chart data
  const calculateAgeChartData = () => {
    const ageGroups: { [key: number]: { english: number; portuguese: number; spanish: number } } = {};

    activeChild.selectedLanguages.forEach(language => {
      const categories = activeChild.categories[language];
      if (categories) {
        Object.values(categories).forEach(category => {
          category.words.forEach(word => {
            if (word.speaking && word.firstSpokenAge !== null) {
              const age = word.firstSpokenAge;
              if (!ageGroups[age]) {
                ageGroups[age] = { english: 0, portuguese: 0, spanish: 0 };
              }
              ageGroups[age][language]++;
            }
          });
        });
      }
    });

    const sortedAges = Object.keys(ageGroups)
      .map(ageStr => parseInt(ageStr))
      .sort((a, b) => a - b);

    let cumulativeEnglish = 0;
    let cumulativePortuguese = 0;
    let cumulativeSpanish = 0;

    return sortedAges.map(age => {
      const group = ageGroups[age];
      cumulativeEnglish += group.english;
      cumulativePortuguese += group.portuguese;
      cumulativeSpanish += group.spanish;

      return {
        age,
        english: cumulativeEnglish,
        portuguese: cumulativePortuguese,
        spanish: cumulativeSpanish,
        total: cumulativeEnglish + cumulativePortuguese + cumulativeSpanish
      };
    });
  };

  // Generate SVG charts for better PDF compatibility
  const generateLanguageDistributionSVG = (): string => {
    if (activeChild.selectedLanguages.length < 2 || totalSpoken === 0) return '';

    let svgBars = '';
    let currentX = 0;
    let labels = '';

    languageStats.forEach((langStat, index) => {
      const percentage = Math.round((langStat.totalSpoken / totalSpoken) * 100);
      const color = getLanguageColor(langStat.language);
      const width = (percentage / 100) * 300; // 300px total width

      svgBars += `
        <rect x="${currentX}" y="0" width="${width}" height="30" fill="${color}" rx="4" />
        <text x="${currentX + width/2}" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${percentage}%</text>
      `;

      labels += `
        <circle cx="${20 + index * 90}" cy="50" r="6" fill="${color}" />
        <text x="${32 + index * 90}" y="55" font-size="9" fill="#2C3E50">${getLanguageName(langStat.language)} (${langStat.totalSpoken})</text>
      `;

      currentX += width;
    });

    return `
      <div class="chart-section">
        <h3>Language Distribution</h3>
        <svg width="300" height="80" style="border-radius: 8px;">
          ${svgBars}
          ${labels}
        </svg>
      </div>
    `;
  };

  const generateAgeChartSVG = (): string => {
    const ageData = calculateAgeChartData();
    if (ageData.length === 0) {
      return `
        <div class="chart-section">
          <h3>Cumulative Words by Age</h3>
          <div class="no-data">No age data available</div>
        </div>
      `;
    }

    const maxTotal = Math.max(...ageData.map(d => d.total));
    const barWidth = Math.min(18, 280 / ageData.length);
    const chartHeight = 100;

    let svgBars = '';
    let labels = '';

    ageData.forEach((dataPoint, index) => {
      const x = index * (barWidth + 2);
      const totalHeight = (dataPoint.total / maxTotal) * chartHeight;

      let currentY = chartHeight;

      // English segment
      if (activeChild.selectedLanguages.includes('english') && dataPoint.english > 0) {
        const englishHeight = (dataPoint.english / dataPoint.total) * totalHeight;
        currentY -= englishHeight;
        svgBars += `<rect x="${x}" y="${currentY}" width="${barWidth}" height="${englishHeight}" fill="#9eb7dd" rx="1" />`;
      }

      // Portuguese segment
      if (activeChild.selectedLanguages.includes('portuguese') && dataPoint.portuguese > 0) {
        const portugueseHeight = (dataPoint.portuguese / dataPoint.total) * totalHeight;
        currentY -= portugueseHeight;
        svgBars += `<rect x="${x}" y="${currentY}" width="${barWidth}" height="${portugueseHeight}" fill="#e7984d" rx="1" />`;
      }

      // Spanish segment
      if (activeChild.selectedLanguages.includes('spanish') && dataPoint.spanish > 0) {
        const spanishHeight = (dataPoint.spanish / dataPoint.total) * totalHeight;
        currentY -= spanishHeight;
        svgBars += `<rect x="${x}" y="${currentY}" width="${barWidth}" height="${spanishHeight}" fill="#b19dd9" rx="1" />`;
      }

      labels += `
        <text x="${x + barWidth/2}" y="${chartHeight + 15}" text-anchor="middle" font-size="7" fill="#666">${dataPoint.age}m</text>
        <text x="${x + barWidth/2}" y="${chartHeight + 25}" text-anchor="middle" font-size="7" fill="#2C3E50" font-weight="bold">${dataPoint.total}</text>
      `;
    });

    let legend = '';
    let legendIndex = 0;
    if (activeChild.selectedLanguages.includes('english')) {
      legend += `<rect x="${10 + legendIndex * 70}" y="140" width="8" height="8" fill="#9eb7dd" rx="2" /><text x="${22 + legendIndex * 70}" y="147" font-size="8" fill="#2C3E50">English</text>`;
      legendIndex++;
    }
    if (activeChild.selectedLanguages.includes('portuguese')) {
      legend += `<rect x="${10 + legendIndex * 70}" y="140" width="8" height="8" fill="#e7984d" rx="2" /><text x="${22 + legendIndex * 70}" y="147" font-size="8" fill="#2C3E50">Portuguese</text>`;
      legendIndex++;
    }
    if (activeChild.selectedLanguages.includes('spanish')) {
      legend += `<rect x="${10 + legendIndex * 70}" y="140" width="8" height="8" fill="#b19dd9" rx="2" /><text x="${22 + legendIndex * 70}" y="147" font-size="8" fill="#2C3E50">Spanish</text>`;
    }

    return `
      <div class="chart-section">
        <h3>Cumulative Words by Age</h3>
        <svg width="300" height="160">
          ${svgBars}
          ${labels}
          ${legend}
        </svg>
      </div>
    `;
  };

  // Generate language breakdown with all words displayed
  const generateLanguageBreakdown = (): string => {
    const numLanguages = languageStats.length;
    const columnClass = numLanguages === 3 ? 'language-column-thirds' : 'language-column';

    return languageStats.map(langStat => {
      const langName = getLanguageName(langStat.language);
      const color = getLanguageColor(langStat.language);

      let categoryHTML = '';
      Object.entries(langStat.categories).forEach(([categoryKey, categoryData]) => {
        if (categoryData.understood > 0 || categoryData.spoken > 0) {
          const categoryName = categoryKey === 'other' ? 'Other' :
                             categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

          categoryHTML += `
            <div class="category">
              <div class="category-header">
                <span class="category-name">${categoryName}</span>
                <span class="category-stats">
                  <span class="u-count">U:${categoryData.understood}</span>
                  <span class="s-count">S:${categoryData.spoken}</span>
                </span>
              </div>
          `;

          if (categoryData.words.length > 0) {
            // Display ALL words the baby speaks, no truncation
            const wordsList = categoryData.words.join(', ');
            categoryHTML += `<div class="word-list">${wordsList}</div>`;
          }

          categoryHTML += '</div>';
        }
      });

      return `
        <div class="${columnClass}">
          <div class="language-header" style="background: linear-gradient(135deg, ${color}, ${color}99); border-left: 4px solid ${color};">
            <h2>${langName}</h2>
            <div class="lang-stats-inline">
              <div class="stat-item understanding">
                <span class="stat-num">${langStat.totalUnderstood}</span>
                <span class="stat-label">Understanding</span>
              </div>
              <div class="stat-item speaking">
                <span class="stat-num">${langStat.totalSpoken}</span>
                <span class="stat-label">Speaking</span>
              </div>
            </div>
          </div>
          <div class="categories-scrollable">
            ${categoryHTML}
          </div>
        </div>
      `;
    }).join('');
  };

  const logoPath = '/Users/lgoergen/Documents/Repositories/LinguistCubMobile/Visuals_transparent/logo_transparent.png';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeChild.name}'s Language Development Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 6mm;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      font-size: 8px;
      line-height: 1.2;
      color: #2C3E50;
      /* Baby blue gradient background matching the app */
      background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 25%, #ADD8E6 50%, #87CEFA 75%, #B0C4DE 100%);
      min-height: 100vh;
      padding: 4px;
    }

    .container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 10px;
      height: calc(100vh - 8px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(135, 206, 235, 0.2);
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(10px);
    }

    .header {
      background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 50%, #ADD8E6 100%);
      color: white;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 6px;
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
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .logo-container {
      width: 32px;
      height: 32px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(5px);
    }

    .logo {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 1px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
      font-style: italic;
      background: linear-gradient(45deg, #ffffff, #f0f8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tagline {
      font-size: 9px;
      opacity: 0.95;
      font-weight: 500;
      letter-spacing: 0.3px;
      margin-top: 2px;
    }

    .child-info {
      background: rgba(255,255,255,0.15);
      padding: 6px;
      border-radius: 6px;
      margin-top: 6px;
      backdrop-filter: blur(10px);
    }

    .child-name {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 3px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      opacity: 0.9;
      font-weight: 500;
    }

    .main-stats {
      display: flex;
      gap: 4px;
      margin-bottom: 6px;
    }

    .stat-card {
      flex: 1;
      padding: 8px;
      border-radius: 6px;
      text-align: center;
      color: white;
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
      box-shadow: 0 3px 10px rgba(135, 206, 235, 0.3);
    }

    .stat-card.speaking {
      background: linear-gradient(135deg, #B0C4DE 0%, #87CEFA 100%);
      box-shadow: 0 3px 10px rgba(176, 196, 222, 0.3);
    }

    .stat-number {
      font-size: 22px;
      font-weight: 900;
      margin-bottom: 2px;
      position: relative;
      z-index: 2;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .stat-title {
      font-size: 8px;
      font-weight: 600;
      position: relative;
      z-index: 2;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .charts-row {
      display: flex;
      gap: 4px;
      margin-bottom: 6px;
      min-height: 160px;
    }

    .chart-section {
      flex: 1;
      background: rgba(255,255,255,0.9);
      padding: 8px;
      border-radius: 6px;
      border: 1px solid rgba(135, 206, 235, 0.2);
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      backdrop-filter: blur(5px);
    }

    .chart-section h3 {
      font-size: 9px;
      margin-bottom: 6px;
      text-align: center;
      color: #2C3E50;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .no-data {
      text-align: center;
      color: #607D8B;
      font-style: italic;
      font-size: 8px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 4px;
      border: 2px dashed #dee2e6;
    }

    .languages {
      display: flex;
      gap: 4px;
      flex: 1;
      overflow: hidden;
    }

    .language-column {
      flex: 1;
      background: rgba(255,255,255,0.9);
      border-radius: 6px;
      padding: 6px;
      font-size: 7px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      border: 1px solid rgba(135, 206, 235, 0.1);
      display: flex;
      flex-direction: column;
    }

    .language-column-thirds {
      flex: 1;
      background: rgba(255,255,255,0.9);
      border-radius: 6px;
      padding: 4px;
      font-size: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      border: 1px solid rgba(135, 206, 235, 0.1);
      display: flex;
      flex-direction: column;
      min-width: 0; /* Allow shrinking */
    }

    .language-header {
      padding: 6px;
      border-radius: 4px;
      margin-bottom: 4px;
      color: white;
    }

    .language-header h2 {
      font-size: 10px;
      margin-bottom: 3px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .language-column-thirds .language-header h2 {
      font-size: 8px;
      margin-bottom: 2px;
    }

    .lang-stats-inline {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .stat-item {
      text-align: center;
      background: rgba(255,255,255,0.2);
      padding: 2px 6px;
      border-radius: 4px;
      backdrop-filter: blur(5px);
    }

    .language-column-thirds .stat-item {
      padding: 1px 3px;
    }

    .stat-num {
      font-size: 12px;
      font-weight: 900;
      display: block;
      margin-bottom: 1px;
    }

    .language-column-thirds .stat-num {
      font-size: 10px;
    }

    .stat-label {
      font-size: 6px;
      text-transform: uppercase;
      letter-spacing: 0.2px;
      opacity: 0.9;
    }

    .language-column-thirds .stat-label {
      font-size: 5px;
    }

    .categories-scrollable {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .category {
      background: white;
      border-radius: 3px;
      padding: 3px;
      border: 1px solid #e9ecef;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .language-column-thirds .category {
      padding: 2px;
    }

    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }

    .category-name {
      font-weight: 700;
      font-size: 7px;
      color: #2C3E50;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }

    .language-column-thirds .category-name {
      font-size: 6px;
    }

    .category-stats {
      display: flex;
      gap: 2px;
    }

    .u-count, .s-count {
      padding: 1px 3px;
      border-radius: 2px;
      font-size: 6px;
      font-weight: 700;
    }

    .language-column-thirds .u-count,
    .language-column-thirds .s-count {
      font-size: 5px;
      padding: 1px 2px;
    }

    .u-count {
      background: #d4edda;
      color: #155724;
    }

    .s-count {
      background: #d1ecf1;
      color: #0c5460;
    }

    .word-list {
      background: linear-gradient(135deg, #fff3cd, #ffeaa7);
      padding: 2px 3px;
      border-radius: 2px;
      font-size: 6px;
      color: #533d03;
      line-height: 1.2;
      border: 1px solid rgba(255, 234, 167, 0.5);
      font-weight: 500;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .language-column-thirds .word-list {
      font-size: 5px;
      padding: 1px 2px;
    }

    .footer {
      background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%);
      color: white;
      padding: 6px;
      text-align: center;
      border-radius: 6px;
      margin-top: auto;
      font-size: 7px;
      font-weight: 600;
      position: relative;
      overflow: hidden;
    }

    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      animation: shimmer 4s infinite;
    }

    svg {
      border-radius: 4px;
      background: rgba(248, 249, 250, 0.8);
    }

    svg text {
      font-family: inherit;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-section">
        <div class="logo-container">
          🐻
        </div>
        <div>
          <div class="logo">Linguist Cub</div>
          <div class="tagline">Professional Language Development Report</div>
        </div>
      </div>
      <div class="child-info">
        <div class="child-name">${activeChild.name}</div>
        <div class="info-row">
          <span>👶 Age: ${formatAge(childAge)}</span>
          <span>📅 ${formatDate(currentDate)}</span>
          <span>🌍 ${activeChild.selectedLanguages.map(lang => getLanguageName(lang)).join(', ')}</span>
        </div>
      </div>
    </div>

    <div class="main-stats">
      <div class="stat-card understanding">
        <div class="stat-number">${totalUnderstood}</div>
        <div class="stat-title">Understanding</div>
      </div>
      <div class="stat-card speaking">
        <div class="stat-number">${totalSpoken}</div>
        <div class="stat-title">Speaking</div>
      </div>
    </div>

    <div class="charts-row">
      ${generateLanguageDistributionSVG()}
      ${generateAgeChartSVG()}
    </div>

    <div class="languages">
      ${generateLanguageBreakdown()}
    </div>

    <div class="footer">
      🎯 Generated by Linguist Cub v1.0.0 • ${currentDate.toLocaleDateString()} • Professional Language Development Analysis
    </div>
  </div>
</body>
</html>
  `;
};