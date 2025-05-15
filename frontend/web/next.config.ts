import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  },
  
  distDir: '.next',
  
  async rewrites() {
    return [
      {
        source: '/wallet-api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://rpc1-taupe.vercel.app/api/:path*'
          : 'http://localhost:3001/api/:path*',
      }
    ];
  },
  
  // En-têtes pour résoudre les problèmes CORS et COOP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          }
        ],
      },
    ];
  },
};

export default nextConfig;