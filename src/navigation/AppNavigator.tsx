import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { RootStackParamList } from '../types';
import { theme } from '../constants/theme';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddWordScreen from '../screens/AddWordScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: theme.fontSizes.lg,
          },
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Linguist Cub',
            headerTitleStyle: {
              fontSize: theme.fontSizes.xl,
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={({ route }) => ({
            title: route.params.language === 'english' ? '🇬🇧 English' : '🇧🇷 Portuguese',
          })}
        />
        <Stack.Screen
          name="CategoryDetail"
          component={CategoryDetailScreen}
          options={({ route }) => ({
            title: 'Words',
          })}
        />
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{
            title: 'Statistics',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="AddWord"
          component={AddWordScreen}
          options={{
            title: 'Add Custom Word',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;