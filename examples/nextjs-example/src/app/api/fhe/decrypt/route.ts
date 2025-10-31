import { NextRequest, NextResponse } from 'next/server';
import type { DecryptionAPIRequest, DecryptionAPIResponse } from '@/types/api';

/**
 * Decryption API Route
 *
 * POST /api/fhe/decrypt
 * Decrypts FHE data
 */

export async function POST(request: NextRequest): Promise<NextResponse<DecryptionAPIResponse>> {
  try {
    const body: DecryptionAPIRequest = await request.json();
    const { contractAddress, handle, userAddress, signature } = body;

    // Validate required fields
    if (!contractAddress || !handle || !userAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: contractAddress, handle, userAddress',
        },
        { status: 400 }
      );
    }

    // Note: Decryption requires user signature and is typically handled client-side
    // This endpoint is a placeholder for demonstration purposes

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Signature required for decryption',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        value: 'Decrypted value placeholder',
        type: 'uint32',
      },
    });
  } catch (error) {
    console.error('Decryption error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Decryption endpoint. Use POST to decrypt data.',
    note: 'Requires EIP-712 signature from data owner',
  });
}
