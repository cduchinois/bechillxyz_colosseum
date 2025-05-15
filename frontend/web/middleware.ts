// lib/cors-middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function corsMiddleware(request: NextRequest) {
  // Vérifier si c'est une requête OPTIONS (pre-flight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Pour les autres requêtes, ajouter les en-têtes CORS
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  return response;
}