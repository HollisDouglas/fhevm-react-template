import { NextRequest, NextResponse } from 'next/server';

/**
 * FHE Operations API Route
 *
 * GET /api/fhe - Get FHE status
 * POST /api/fhe - Perform FHE operation
 */

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'FHE API is operational',
      endpoints: {
        encrypt: '/api/fhe/encrypt',
        decrypt: '/api/fhe/decrypt',
        compute: '/api/fhe/compute',
        keys: '/api/keys',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...params } = body;

    return NextResponse.json({
      success: true,
      message: `Operation ${operation} received`,
      data: params,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
