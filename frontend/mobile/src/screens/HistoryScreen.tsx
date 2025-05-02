import React from 'react';
import {View, Text, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import Header from '../components/Header';

// Interface pour le type de transaction
interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  action: string;
  amount: string;
  currency: string;
  destination: string;
  date: string;
}

// Données fictives pour les transactions
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'outgoing',
    action: 'Transfer',
    amount: '0.0203',
    currency: 'SOL',
    destination: 'Oxe983b...31146FA',
    date: 'April 29 2025',
  },
  {
    id: '2',
    type: 'incoming',
    action: 'Transfer',
    amount: '0.0203',
    currency: 'SOL',
    destination: 'Oxe983b...31146FA',
    date: 'April 29 2025',
  },
  {
    id: '3',
    type: 'outgoing',
    action: 'Transfer',
    amount: '0.203',
    currency: 'USDC',
    destination: 'Oxe983b...31146FA',
    date: 'April 29 2025',
  },
  {
    id: '4',
    type: 'incoming',
    action: 'Transfer',
    amount: '0.203',
    currency: 'USDC',
    destination: 'Oxe983b...31146FA',
    date: 'April 29 2025',
  },
  {
    id: '5',
    type: 'outgoing',
    action: 'Transfer',
    amount: '0.203',
    currency: 'USDC',
    destination: 'Oxe983b...31146FA',
    date: 'April 29 2025',
  },
  {
    id: '6',
    type: 'outgoing',
    action: 'Transfer',
    amount: '0.0203',
    currency: 'JUP',
    destination: 'Oxe983b...31146FA',
    date: 'April 29 2025',
  },
  {
    id: '7',
    type: 'incoming',
    action: 'Transfer',
    amount: '0.0203',
    currency: 'JUP',
    destination: 'Oxe983b...31146FA',
    date: 'April 29 2025',
  },
];

// Fonction utilitaire pour grouper les transactions par date et par crypto
const groupTransactions = (transactions: Transaction[]) => {
  // Grouper par date d'abord
  const byDate: Record<string, Transaction[]> = {};
  transactions.forEach(transaction => {
    if (!byDate[transaction.date]) {
      byDate[transaction.date] = [];
    }
    byDate[transaction.date].push(transaction);
  });

  // Pour chaque date, grouper les transactions par type de crypto
  const groupedTransactions: Record<string, Record<string, Transaction[]>> = {};
  Object.keys(byDate).forEach(date => {
    groupedTransactions[date] = {};

    // Trier par ordre des cryptos comme dans la maquette: SOL, USDC, JUP
    const sortOrder: {[key: string]: number} = {SOL: 1, USDC: 2, JUP: 3};

    byDate[date]
      .sort((a, b) => sortOrder[a.currency] - sortOrder[b.currency])
      .forEach(transaction => {
        if (!groupedTransactions[date][transaction.currency]) {
          groupedTransactions[date][transaction.currency] = [];
        }
        groupedTransactions[date][transaction.currency].push(transaction);
      });
  });

  return groupedTransactions;
};

// Composant pour une transaction individuelle
const TransactionItem = ({transaction}: {transaction: Transaction}) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionLeftContent}>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>
          {transaction.type === 'outgoing' ? '↑' : '↓'}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionType}>{transaction.action}</Text>
        <Text style={styles.transactionDestination}>
          To: {transaction.destination}
        </Text>
      </View>
    </View>

    <Text
      style={[
        styles.transactionAmount,
        transaction.type === 'outgoing'
          ? styles.outgoingAmount
          : styles.incomingAmount,
      ]}>
      {transaction.type === 'outgoing' ? '-' : '+'}
      {transaction.amount} {transaction.currency}
    </Text>
  </View>
);

// Composant pour un groupe de transactions par crypto-monnaie
const CryptoTransactionGroup = ({
  transactions,
}: {
  transactions: Transaction[];
}) => (
  <View style={styles.transactionCard}>
    {transactions.map(transaction => (
      <TransactionItem key={transaction.id} transaction={transaction} />
    ))}
  </View>
);

// Écran principal des transactions
interface HistoryScreenProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = _props => {
  const groupedTransactions = groupTransactions(mockTransactions);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <Text style={styles.screenTitle}>History</Text>

        {Object.keys(groupedTransactions).map(date => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>

            {Object.keys(groupedTransactions[date]).map((currency, index) => (
              <View
                key={currency}
                style={[
                  styles.cryptoGroup,
                  index > 0 && styles.cryptoGroupMargin,
                ]}>
                <CryptoTransactionGroup
                  transactions={groupedTransactions[date][currency]}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0ff', // Couleur de fond légèrement violette
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8A2BE2',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 14,
    color: '#8A2BE2',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  cryptoGroup: {
    marginHorizontal: 15,
  },
  cryptoGroupMargin: {
    marginTop: 15, // Espace entre les groupes de crypto-monnaies
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  transactionLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    marginRight: 10,
  },
  arrow: {
    fontSize: 18,
    color: '#8A2BE2',
  },
  transactionDetails: {
    justifyContent: 'center',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDestination: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  outgoingAmount: {
    color: '#333',
  },
  incomingAmount: {
    color: '#4CAF50', // Couleur verte pour les transactions entrantes
  },
});

export default HistoryScreen;
