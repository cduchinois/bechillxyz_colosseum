import React, {useState, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, StyleSheet, AsyncStorage} from 'react-native';
import MainScreen from '../screens/MainScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WalletStoryScreen from '../screens/WalletStoryScreen';
import {useAuthorization} from '../../src/components/providers/AuthorizationProvider';

// Simple placeholder screen
function InfoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Information Screen</Text>
    </View>
  );
}

// Create a stack navigator
const Stack = createNativeStackNavigator();

// Main navigator component
function AppNavigator() {
  const {selectedAccount} = useAuthorization();
  const isConnected = !!selectedAccount;

  // State pour déterminer si c'est la première connexion de l'utilisateur
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Vérifier si c'est la première utilisation (normalement, on utiliserait AsyncStorage)
  useEffect(() => {
    // Simulons la vérification du premier lancement
    // Dans une vraie app, vous utiliseriez AsyncStorage
    const checkFirstTime = async () => {
      try {
        // Cette partie serait normalement asynchrone avec AsyncStorage
        // const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');
        // setIsFirstTime(hasLaunchedBefore !== 'true');
        // if (isFirstTime) {
        //   await AsyncStorage.setItem('hasLaunchedBefore', 'true');
        // }

        // Pour notre simulation, on va juste utiliser un state local
        setIsFirstTime(true); // Force la première expérience à chaque lancement
      } catch (error) {
        console.error('Error checking first time status:', error);
      }
    };

    checkFirstTime();
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {isConnected ? (
        // L'utilisateur est connecté, montrer l'écran info
        <Stack.Screen name="Info" component={InfoScreen} />
      ) : // L'utilisateur n'est pas connecté
      isFirstTime ? (
        // C'est sa première fois, montrer l'onboarding
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="WalletStory" component={WalletStoryScreen} />
          <Stack.Screen name="Connect" component={MainScreen} />
        </>
      ) : (
        // Ce n'est pas sa première fois, montrer directement l'écran de connexion
        <Stack.Screen name="Connect" component={MainScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AppNavigator;
