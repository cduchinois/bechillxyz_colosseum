// Components/Header.tsx
import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
<<<<<<< HEAD
=======
import {Colors} from '../constants/GlobalStyles';
>>>>>>> web

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/img/bechill-head2.png')}
          style={styles.logo}
        />
<<<<<<< HEAD
        <Text style={styles.logoText}>beChill</Text>
      </View>
=======
        <Text style={styles.logoText}>ChillSpace</Text>
      </View>
      {/* Ligne blanche */}
      <View style={styles.underline} />
>>>>>>> web
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
<<<<<<< HEAD
    flexDirection: 'row',
    alignItems: 'center',
=======
>>>>>>> web
    padding: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
=======
    padding: 10,
>>>>>>> web
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
<<<<<<< HEAD
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginLeft: 10,
=======
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
>>>>>>> web
  },
});

export default Header;
