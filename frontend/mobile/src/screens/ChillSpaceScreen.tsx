import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Header from '../components/Header';
import {GlobalStyles as GS} from '../constants/GlobalStyles';
import {Colors} from '../constants/GlobalStyles';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

const background = require('../../assets/img/BeChill_landing_bg.png');

const ChillSpaceScreen = () => {
  const maxBarWidth = 120;
  return (
    <ImageBackground
      source={background}
      style={styles.mainContainer}
      resizeMode="cover">
      <View>
        <Header />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.cloudSection}>
            <View style={styles.cloudWrapper}>
              <Image
                source={require('../../assets/img/cloud.png')}
                style={styles.cloudImage}
                resizeMode="contain"
              />
              <View style={styles.chillScoreContainer}>
                <Text style={styles.chillScoreTitle}>chill score</Text>
                <Text style={styles.chillScore}>76</Text>
              </View>
            </View>

            <Text style={styles.status}>
              Your bag is mostly in sync — just a few tweaks away from smooth
              sailing.
            </Text>
            <View style={styles.button}>
              <Text style={GS.buttonSecondaryText}>IMPROVE</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardLabel}>🎯 Your goal</Text>
                <Text style={styles.cardContentGoal}>
                  steady growth, low risk
                </Text>
              </View>
              <Feather
                name="edit"
                size={24}
                color="#888"
                style={styles.editIcon}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.portfolioRow}>
              {/* Colonne gauche */}
              <View style={styles.portfolioValueCol}>
                <Text style={styles.cardLabel}>📊 Portfolio</Text>
                <Text style={styles.cardValue}>$4,832</Text>
                <Text style={styles.cardTotalValue}>Total value</Text>
              </View>

              {/* Colonne droite */}
              <View style={styles.portfolioAssetsCol}>
                <Text style={styles.cardLabel}>Top assets</Text>

                <View style={styles.assetRow}>
                  <Text style={styles.assetName}>ETH</Text>
                  <View style={{width: maxBarWidth * 1.0}}>
                    <View
                      style={[
                        styles.assetBarSmall,
                        {backgroundColor: '#6F2CFF', width: '100%'},
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.assetRow}>
                  <Text style={styles.assetName}>SOL</Text>
                  <View style={{width: maxBarWidth * 0.6}}>
                    <View
                      style={[
                        styles.assetBarSmall,
                        {backgroundColor: '#B4D8F8', width: '100%'},
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.assetRow}>
                  <Text style={styles.assetName}>JTO</Text>
                  <View style={{width: maxBarWidth * 0.3}}>
                    <View
                      style={[
                        styles.assetBarSmall,
                        {backgroundColor: '#ADFF2F', width: '100%'},
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>↩️ Last action</Text>
            <Text style={styles.cardContent}>
              You rebalanced your portfolio 2 days ago. Smart move.
            </Text>
          </View>

          <View style={[styles.card, styles.cardComingSoon]}>
            <Text style={styles.cardLabel}>🕐 Objective (coming soon)</Text>
            <Text style={[styles.cardContent, styles.comingSoonText]}>
              Chill score › 80
            </Text>
            <Text style={[styles.cardContent, styles.comingSoonText]}>
              Set up a DCA plan
            </Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  valueBlock: {
    marginBottom: 12,
  },

  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 6,
  },

  assetName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 40,
  },

  assetBarSmall: {
    height: 10,

    marginLeft: 6,
  },

  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTotalValue: {
    fontSize: 18,
    color: '#888',
    marginTop: 2,
  },
  editIcon: {
    marginLeft: 12,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },
  cloudSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cloudImage: {
    width: width * 0.7, // avant : 0.5
    height: width * 0.5, // avant : 0.3
    marginBottom: 10,
  },

  cloudWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chillScoreContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chillScoreTitle: {
    paddingTop: 30,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chillScore: {
    fontSize: 48,
    color: Colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  status: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#333',
    fontSize: 18,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  cardContentGoal: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  cardContent: {
    color: '#333',
    fontSize: 16,
    fontWeight: '400',
  },
  cardValue: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
  },
  assetItem: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
  },
  assetBar: {
    height: 5,
    borderRadius: 4,
    width: '100%',
  },
  cardComingSoon: {
    opacity: 0.8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#999',
  },
  comingSoonText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 14,
  },
  portfolioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },

  portfolioValueCol: {
    flex: 1,
  },

  portfolioAssetsCol: {
    flex: 2,
  },
});

export default ChillSpaceScreen;
