import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Colors} from '../constants/GlobalStyles';

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/img/bechill-head2.png')}
          style={styles.logo}
        />
        <Text style={styles.logoText}>ChillSpace</Text>
      </View>
      {/* Ligne blanche */}
      <View style={styles.underline} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 10,
  },
  underline: {
    marginTop: 10,
    height: 1,
    backgroundColor: 'white',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 1,
  },
});

export default Header;
