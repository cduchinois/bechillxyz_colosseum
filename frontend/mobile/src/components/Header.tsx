import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from '../constants/GlobalStyles';

export function Header() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <ImageBackground
      accessibilityRole="image"
      testID="new-app-screen-header"
      source={require('../../assets/img/background.png')}
      style={[
        styles.background,
        {
          backgroundColor: isDarkMode
            ? Colors.textPrimary
            : Colors.textSecondary,
        },
      ]}
      imageStyle={styles.logo}>
      <View>
        <Text style={styles.title}>BeChill</Text>
        <Text style={styles.subtitle}>
          Build by degens,{'\n'}for degens{'\n'} just Chill
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    paddingBottom: 40,
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  logo: {
    overflow: 'visible',
    resizeMode: 'cover',
  },
  subtitle: {
    color: '#333',
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'PP Monument Extended',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  title: {
    color: '#fff',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'PP Monument Extended',
  },
});
