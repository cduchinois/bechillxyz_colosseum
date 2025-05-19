import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { signature } = req.query;
  const heliusApiKey = process.env.HELIUS_API_KEY;

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Transaction signature is required' });
  }

  if (!heliusApiKey) {
    return res.status(500).json({ error: 'Helius API key is not configured' });
  }
  
  console.log('Using Helius API key:', heliusApiKey);

  try {
    console.log(`Fetching transaction details for signature: ${signature}`);
    
    // Direct implementation without using the library
    // Fix: Using the standard Helius RPC URL format (consistent with fetch.ts and other endpoints)
    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    
    const requestData = {
      jsonrpc: '2.0',
      id: 'tx-detail-request',
      method: 'getTransaction',
      params: [
        signature,
        { encoding: 'json', maxSupportedTransactionVersion: 0 }
      ]
    };
    
    console.log('Making RPC request with data:', JSON.stringify(requestData, null, 2));
    
    console.log(`Making request to ${rpcUrl}`);
    
    const response = await axios.post(rpcUrl, requestData);
    
    console.log('Response status:', response.status);
    console.log('Response data keys:', Object.keys(response.data));
    
    if (response.data.error) {
      console.error('RPC Error:', JSON.stringify(response.data.error));
      throw new Error(`RPC Error: ${JSON.stringify(response.data.error)}`);
    }

    if (!response.data.result) {
      console.error('Transaction not found. Full response:', JSON.stringify(response.data));
      throw new Error('Transaction not found');
    }
    
    console.log('Transaction data received successfully');

    const txData = response.data.result;
    
    // Extract memo if exists
    let memo = null;
    try {
      const instructions = txData.transaction.message.instructions;
      for (const instruction of instructions) {
        if (instruction.programId === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr') {
          // This is a memo instruction
          if (instruction.data) {
            memo = Buffer.from(instruction.data, 'base64').toString('utf8');
            break;
          }
        }
      }
    } catch (memoError) {
      // Ignore errors in memo extraction
      console.warn('Failed to extract memo:', memoError);
    }

    // Format response
    const transactionDetail = {
      signature,
      blockTime: txData.blockTime,
      slot: txData.slot,
      fee: txData.meta?.fee || 0,
      err: txData.meta?.err,
      memo: memo,
      status: txData.meta?.err ? 'failed' : (txData.confirmationStatus || 'confirmed'),
      raw: txData,
      // Include parsed transaction if available
      parsedTransaction: txData.transaction
    };

    return res.status(200).json(transactionDetail);
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    
    let errorMessage = 'Failed to fetch transaction details';
    let errorDetails = '';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `Error response from RPC server: ${error.response.status}`;
        errorDetails = JSON.stringify(error.response.data, null, 2);
        console.error('Response error data:', errorDetails);
      } else if (error.request) {
        errorMessage = 'No response received from RPC server';
        console.error('No response received from request:', error.request);
      } else {
        errorMessage = `Error setting up request: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      details: errorDetails || (error instanceof Error ? error.message : String(error))
    });
  }
}