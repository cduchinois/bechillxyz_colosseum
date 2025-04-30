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

export default function AccountInfo({
  balance,
  selectedAccount,
}: AccountInfoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.walletHeader}>Wallet Account Info</Text>
        <Text style={styles.walletBalance}>
          {selectedAccount.label
            ? `${selectedAccount.label}: ◎${
                balance ? convertLamportsToSOL(balance) : '0'
              } SOL`
            : 'Wallet name not found'}
        </Text>
        <Text style={styles.walletAddressLabel}>Wallet Address:</Text>
        <Text style={styles.walletAddress}>{selectedAccount.address}</Text>
        <View style={styles.buttonGroup}>
          <DisconnectButton title={'Disconnect'} />

          {/* <RequestAirdropButton
            selectedAccount={selectedAccount}
            onAirdropComplete={async (account: Account) =>
              await fetchAndUpdateBalance(account)
            }
          /> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  textContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonGroup: {
    flexDirection: 'row',
    columnGap: 10,
    marginTop: 20,
  },
  walletHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  walletBalance: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#8A2BE2',
  },
  walletAddressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  walletAddress: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
});
