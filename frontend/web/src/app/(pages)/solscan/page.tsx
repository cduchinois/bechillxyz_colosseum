'use client';

import { useState } from 'react';

export default function SolscanTestPage() {
  const [wallet, setWallet] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPortfolio = async () => {
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`/api/portfolio?address=${wallet}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Erreur lors de l’appel API :', err);
      setData({ error: 'Erreur lors de l’appel API' });
    } finally {
      setLoading(false);
    }
  };

  const isMemecoin = (name: string) => {
    const lower = name.toLowerCase();
    return (
      lower.includes('fart') ||
      lower.includes('oblivion') ||
      lower.includes('whale') ||
      lower.includes('keiko') ||
      lower.includes('pump')
    );
  };

  return (
    <div className="font-poppins" style={{ padding: '2rem' }}>
      <h1>Test API Solscan</h1>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          placeholder="Adresse wallet Solana"
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button onClick={fetchPortfolio} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
          Tester
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      {data?.data && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Total Wallet Value: ${data.data.total_value.toFixed(2)}</h2>
          <h3>Nombre de tokens: {data.data.tokens.length + 1} (incl. SOL)</h3>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>🔶 SOL</h4>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: '#f1f1f1',
                padding: '1rem',
                borderRadius: '10px',
              }}
            >
              <img src={data.data.native_balance.token_icon} alt="sol" width={40} />
              <div>
                <strong>SOL</strong> — {data.data.native_balance.balance} ≈ $
                {data.data.native_balance.value.toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h4>🪙 Autres tokens</h4>
            {data.data.tokens.map((token: any) => (
              <div
                key={token.token_address}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: '#fafafa',
                  padding: '1rem',
                  borderBottom: '1px solid #ddd',
                }}
              >
                <img src={token.token_icon} alt={token.token_symbol} width={40} />
                <div>
                  <strong>{token.token_name || 'Unknown'}</strong> ({token.token_symbol}) —{' '}
                  {token.balance} ≈ ${token.value.toFixed(4)}{' '}
                  {isMemecoin(token.token_name) && (
                    <span style={{ color: '#e64a19', marginLeft: '0.5rem' }}>🔥 Memecoin</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.error && (
        <p style={{ color: 'red', marginTop: '2rem' }}>{data.error}</p>
      )}
    </div>
  );
}
