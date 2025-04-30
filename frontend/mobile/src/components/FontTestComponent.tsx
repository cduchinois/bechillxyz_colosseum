import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Fonts} from '../constants/GlobalStyles'; // Ajout de l'import manquant

const FontTestComponent = () => {
  return (
    <View
      style={{
        marginVertical: 20,
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
      }}>
      <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>
        Test des polices :
      </Text>

      <Text
        style={{
          fontFamily: 'DMSerifText-Regular',
          fontSize: 18,
          color: 'green',
          marginBottom: 5,
        }}>
        Police 1: DMSerifText-Regular (direct)
      </Text>

      <Text
        style={{
          fontFamily: Fonts.DMSerif,
          fontSize: 18,
          color: 'blue',
          marginBottom: 5,
        }}>
        Police 2: Fonts.DMSerif (depuis GlobalStyles)
      </Text>

      <Text
        style={{
          fontFamily: 'PPMonumentExtended-Bold',
          fontSize: 18,
          color: 'purple',
          marginBottom: 5,
        }}>
        Police 3: PPMonumentExtended-Bold (direct)
      </Text>

      <Text
        style={{
          fontFamily: Fonts.Monument,
          fontSize: 18,
          color: '#540CCC',
          marginBottom: 5,
        }}>
        Police 4: Fonts.Monument (depuis GlobalStyles)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    margin: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  test1: {
    fontFamily: 'DMSerifText-Regular',
    fontSize: 18,
  },
  test2: {
    fontFamily: 'DMSerifText',
    fontSize: 18,
  },
  test3: {
    fontFamily: 'DM Serif Text',
    fontSize: 18,
  },
  test4: {
    fontFamily: 'DMSerifText_Regular',
    fontSize: 18,
  },
  test5: {
    fontFamily: 'DM_Serif_Text',
    fontSize: 18,
  },
  systemFont: {
    fontSize: 18,
  },
});

export default FontTestComponent;
