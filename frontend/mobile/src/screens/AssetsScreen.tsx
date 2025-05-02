import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Header from '../components/Header';

// Composant pour simuler un mini graphique avec un emoji
const SimpleSparkline = ({trend = 'up', style = {}}) => {
  return (
    <Text style={[styles.sparkline, style]}>
      {trend === 'up' ? '〰️' : '〰️'}
    </Text>
  );
};

// Données fictives pour la démonstration
const mockData = {
  totalNetWorth: 12450,
  tokens: [
    {symbol: 'SOL', percentage: 62, color: '#8A2BE2'},
    {symbol: 'JUP', percentage: 25, color: '#FFFF00'},
    {symbol: 'BONK', percentage: 12, color: '#FFFFFF'},
  ],
  assets: [
    {
      id: '1',
      name: 'Solana',
      symbol: 'SOL',
      price: 256.23,
      priceChange: 1.6,
      quantity: 0.9,
      trend: 'up',
    },
    {
      id: '2',
      name: 'Solana',
      symbol: 'SOL',
      price: 256.23,
      priceChange: 1.6,
      quantity: 0.9,
      trend: 'up',
    },
  ],
};

// Composant WalletHeaderComponent
const WalletHeaderComponent = () => (
  <View style={styles.walletHeader}>
    <Text style={styles.walletTitle}>Wallets</Text>
    <TouchableOpacity style={styles.addButton}>
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

// Composant NetWorthComponent
const NetWorthComponent = ({netWorth}: {netWorth: number}) => (
  <View style={styles.netWorthContainer}>
    <View style={styles.netWorthCircle}>
      <Text style={styles.netWorthLabel}>Total Net Worth</Text>
      <Text style={styles.netWorthValue}>${netWorth.toLocaleString()}</Text>
    </View>
  </View>
);

// Type definition for token
interface Token {
  symbol: string;
  percentage: number;
  color: string;
}

// Composant TokenDistributionComponent
const TokenDistributionComponent = ({tokens}: {tokens: Token[]}) => (
  <View style={styles.tokenDistribution}>
    {tokens.map((token, index) => (
      <View key={index} style={styles.tokenItem}>
        <View style={[styles.tokenIndicator, {backgroundColor: token.color}]} />
        <Text style={styles.tokenSymbol}>{token.symbol}</Text>
        <Text style={styles.tokenPercentage}>{token.percentage}%</Text>
      </View>
    ))}
  </View>
);

// Type definition for asset
interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  quantity: number;
  trend: string;
}

// Composant pour un élément d'actif individuel
// Composant pour un élément d'actif individuel
const AssetItem = ({asset}: {asset: Asset}) => (
  <View style={styles.assetItem}>
    <View style={styles.assetInfo}>
      <View style={styles.assetIcon}>
        <Text style={styles.assetIconText}>{asset.symbol.charAt(0)}</Text>
      </View>
      <View>
        <Text style={styles.assetName}>
          {asset.name} ({asset.symbol})
        </Text>
        <Text
          style={[
            styles.assetChange,
            asset.priceChange >= 0
              ? styles.positiveChange
              : styles.negativeChange,
          ]}>
          {asset.priceChange >= 0 ? '+' : ''}
          {asset.priceChange}%
        </Text>
      </View>
    </View>

    <View style={styles.assetPriceInfo}>
      <SimpleSparkline trend={asset.trend} />
      <View style={styles.assetPriceContainer}>
        <Text style={styles.assetPrice}>€{asset.price.toFixed(2)}</Text>
        <Text style={styles.assetQuantity}>
          {asset.quantity} {asset.symbol}
        </Text>
      </View>
    </View>
  </View>
);

// Composant AssetListComponent
const AssetListComponent = ({assets}: {assets: Asset[]}) => (
  <View style={styles.assetListContainer}>
    <Text style={styles.assetListTitle}>Assets</Text>

    {assets.map(asset => (
      <AssetItem key={asset.id} asset={asset} />
    ))}
  </View>
);

// Définir les types pour les props
interface AssetsScreenProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

// Définir le composant principal et l'exporter correctement
function AssetsScreen(_props: AssetsScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <WalletHeaderComponent />
        <NetWorthComponent netWorth={mockData.totalNetWorth} />
        <TokenDistributionComponent tokens={mockData.tokens} />
        <AssetListComponent assets={mockData.assets} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0ff', // Couleur de fond légèrement violette
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0ff',
  },
  walletTitle: {
    fontSize: 24,
    color: '#8A2BE2',
    fontWeight: '600',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 28,
  },
  netWorthContainer: {
    alignItems: 'center',
    padding: 20,
  },
  netWorthCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 20,
    borderColor: '#8A2BE2',
    borderRightColor: '#f0f0ff',
    borderBottomColor: '#FFFF00',
  },
  netWorthLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  netWorthValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#8A2BE2',
  },
  tokenDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
  },
  tokenItem: {
    alignItems: 'center',
  },
  tokenIndicator: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  tokenSymbol: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  tokenPercentage: {
    fontSize: 12,
    color: '#666',
  },
  assetListContainer: {
    paddingHorizontal: 15,
  },
  assetListTitle: {
    fontSize: 24,
    color: '#8A2BE2',
    fontWeight: '600',
    marginBottom: 15,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0ff',
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetIconText: {
    color: 'white',
    fontWeight: 'bold',
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  assetChange: {
    fontSize: 14,
  },
  positiveChange: {
    color: '#2ecc71',
  },
  negativeChange: {
    color: '#e74c3c',
  },
  assetPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkline: {
    fontSize: 24,
    color: '#8A2BE2',
    marginRight: 10,
  },
  assetPriceContainer: {
    alignItems: 'flex-end',
  },
  assetPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  assetQuantity: {
    fontSize: 14,
    color: '#666',
  },
});

export default AssetsScreen;
