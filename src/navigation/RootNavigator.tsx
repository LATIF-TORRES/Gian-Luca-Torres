import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import CreateTournamentScreen from '../screens/CreateTournamentScreen';
import JoinTournamentScreen from '../screens/JoinTournamentScreen';
import TournamentDetailScreen from '../screens/TournamentDetailScreen';
import MatchScoreScreen from '../screens/MatchScoreScreen';
import AvatarCreatorScreen from '../screens/AvatarCreatorScreen';
import TrainingScreen from '../screens/TrainingScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const modalHeaderOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: '',
  headerTintColor: colors.white,
} as const;

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} options={modalHeaderOptions} />
      <Stack.Screen name="JoinTournament" component={JoinTournamentScreen} options={modalHeaderOptions} />
      <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} options={modalHeaderOptions} />
      <Stack.Screen name="MatchScore" component={MatchScoreScreen} options={modalHeaderOptions} />
      <Stack.Screen name="AvatarCreator" component={AvatarCreatorScreen} options={modalHeaderOptions} />
      <Stack.Screen name="Training" component={TrainingScreen} options={modalHeaderOptions} />
    </Stack.Navigator>
  );
}
