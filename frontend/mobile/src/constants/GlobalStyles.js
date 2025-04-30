// src/constants/GlobalStyles.js

import {StyleSheet, Platform} from 'react-native';

export const Colors = {
  primary: '#540CCC', // Violet chill principal
  secondary: '#FFFF4F', // Jaune éclatant
  backgroundStart: '#A0C5E8', // Dégradé start
  backgroundEnd: '#FAEAB0', // Dégradé end
  textPrimary: '#333333',
  textSecondary: '#666666',
  success: '#4CAF50',
  error: '#F44336',
};

// Utilisation des noms exacts des fichiers de police
export const Fonts = {
  Monument:
    Platform.OS === 'android'
      ? 'PPMonumentExtended-Bold'
      : 'PP Monument Extended',

  // Ajout de la police Monument Italic
  MonumentItalic:
    Platform.OS === 'android'
      ? 'PPMonumentExtended-Italic'
      : 'PP Monument Extended Italic',

  DMSerif: Platform.OS === 'android' ? 'DMSerifText-Regular' : 'DM Serif Text',

  DMSerifItalic:
    Platform.OS === 'android' ? 'DMSerifText-Italic' : 'DM Serif Text Italic',
};

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: Fonts.Monument,
    fontWeight: 'bold',
    fontSize: 28,
    color: Colors.textPrimary,
  },
  titleItalic: {
    fontFamily: Fonts.MonumentItalic, // Nouvelle variante italique pour les titres
    fontSize: 28,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.Monument,
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  subtitleItalic: {
    fontFamily: Fonts.MonumentItalic, // Nouvelle variante italique pour les sous-titres
    fontSize: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bodyText: {
    fontFamily: Fonts.DMSerif,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  bodyTextItalic: {
    fontFamily: Fonts.DMSerifItalic,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    fontFamily: Fonts.Monument,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
