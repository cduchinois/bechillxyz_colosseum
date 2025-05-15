import React from 'react';
import {LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {StyleSheet, View, Text} from 'react-native';
import DisconnectButton from './DisconnectButton';

interface Account {
  address: string;
  label?: string | undefined;
  publicKey: PublicKey;
}

type AccountInfoProps = Readonly<{
  selectedAccount: Account;
  balance: number | null;
  fetchAndUpdateBalance: (account: Account) => void;
}>;

function convertLamportsToSOL(lamports: number) {
  return new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(
    (lamports || 0) / LAMPORTS_PER_SOL,
  );
}

/*
function convertLamportsToUSD(lamports: number, solPrice: number = 150) {
  const sol = lamports / LAMPORTS_PER_SOL;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(sol * solPrice);
}
  */

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function AccountInfo({
  selectedAccount,
  balance,
}: AccountInfoProps) {
  return (
    <View style={styles.card}>
      <View style={styles.leftColumn}>
        <Text style={styles.title}>Connected Wallet</Text>
        <Text style={styles.address}>
          {truncateAddress(selectedAccount.address)}
        </Text>
        <Text style={styles.balance}>
          Total balance:{' '}
          {balance !== null ? convertLamportsToSOL(balance) : '$0.00'}
        </Text>
      </View>

      <DisconnectButton title={'DISCONNECT'} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#540CCC',
    padding: 16,
    borderRadius: 16,
    width: '100%',
  },
  leftColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: '#D1C4E9',
    marginBottom: 4,
  },
  balance: {
    fontSize: 14,
    color: '#B39DDB',
  },
});
