import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ATSCheckerScreen from './src/screens/ATSCheckerScreen';
import ResumeBuilderScreen from './src/screens/ResumeBuilderScreen';

import { COLORS } from './src/styles/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ATSChecker" component={ATSCheckerScreen} />
        <Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
