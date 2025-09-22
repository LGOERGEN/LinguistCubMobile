import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList, Child, AppData } from '../types';
import { dataService } from '../services/dataService';
import { theme, shadows } from '../constants/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await dataService.initializeData();
      setAppData(data);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddChild = () => {
    Alert.prompt(
      'Add New Child',
      'Enter your child\'s name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (name?: string) => {
            if (name && name.trim()) {
              try {
                await dataService.createChild(
                  name.trim(),
                  null,
                  ['english', 'portuguese']
                );
                await loadData();
              } catch (error) {
                Alert.alert('Error', 'Failed to add child');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleSelectChild = async (childId: string) => {
    try {
      await dataService.setActiveChild(childId);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to select child');
    }
  };

  const handleEditChild = (child: Child) => {
    Alert.alert(
      'Edit Child',
      `Edit ${child.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit Name',
          onPress: () => {
            Alert.prompt(
              'Edit Name',
              'Enter new name:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Save',
                  onPress: async (newName?: string) => {
                    if (newName && newName.trim()) {
                      try {
                        await dataService.updateChild(child.id, { name: newName.trim() });
                        await loadData();
                      } catch (error) {
                        Alert.alert('Error', 'Failed to update name');
                      }
                    }
                  },
                },
              ],
              'plain-text',
              child.name
            );
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Child',
              `Are you sure you want to delete ${child.name}? This action cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await dataService.deleteChild(child.id);
                      await loadData();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete child');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return 'Age not set';

    const ageInMonths = dataService.calculateAgeInMonths(birthDate);
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    if (years > 0) {
      return `${years}y ${months}m`;
    }
    return `${months} months`;
  };

  const renderChildProfile = (child: Child) => {
    const isActive = appData?.activeChildId === child.id;

    return (
      <TouchableOpacity
        key={child.id}
        style={[
          styles.childCard,
          isActive && styles.activeChildCard,
        ]}
        onPress={() => handleSelectChild(child.id)}
        onLongPress={() => handleEditChild(child)}
      >
        <View style={styles.childAvatar}>
          <Text style={styles.childInitial}>
            {child.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childAge}>{calculateAge(child.birthDate)}</Text>
        {isActive && <Text style={styles.activeLabel}>Active</Text>}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const children = appData ? Object.values(appData.children) : [];
  const activeChild = dataService.getActiveChild();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Child Profiles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Children</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.childProfiles}>
            {children.map(renderChildProfile)}
            <TouchableOpacity
              style={styles.addChildCard}
              onPress={handleAddChild}
            >
              <View style={styles.addChildIcon}>
                <Text style={styles.addChildText}>+</Text>
              </View>
              <Text style={styles.addChildLabel}>Add Child</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Quick Actions Section */}
      {activeChild && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.english }]}
              onPress={() => navigation.navigate('Categories', { language: 'english' })}
            >
              <Text style={styles.actionButtonText}>🇬🇧 English Words</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.portuguese }]}
              onPress={() => navigation.navigate('Categories', { language: 'portuguese' })}
            >
              <Text style={styles.actionButtonText}>🇧🇷 Portuguese Words</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              onPress={() => navigation.navigate('Statistics')}
            >
              <Text style={styles.actionButtonText}>📊 View Statistics</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Welcome Message */}
      {children.length === 0 && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Linguist Cub!</Text>
          <Text style={styles.welcomeText}>
            Get started by adding your first child profile above.
          </Text>
        </View>
      )}
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
  },
  loadingText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  childProfiles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childCard: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    minWidth: 100,
    ...shadows.sm,
  },
  activeChildCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  childInitial: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  childName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  childAge: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  activeLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: theme.spacing.xs,
  },
  addChildCard: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    minWidth: 100,
  },
  addChildIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addChildText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
  },
  addChildLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    gap: theme.spacing.md,
  },
  actionButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  welcomeContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen;