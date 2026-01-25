import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Check if it's an API route
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const origin = request.headers.get('origin');

        // Handle Preflight (OPTIONS)
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': origin || '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // Pass request down the chain
        const response = NextResponse.next();

        // Add CORS headers to the response
        response.headers.set('Access-Control-Allow-Origin', origin || '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
        response.headers.set('Access-Control-Allow-Credentials', 'true');

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
