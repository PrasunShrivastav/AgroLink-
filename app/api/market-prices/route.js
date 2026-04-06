import { NextResponse } from 'next/server';
import { MANDI_PRICES, SPARKLINE_DATA } from '@/lib/market-data';

export async function GET() {
  return NextResponse.json({ prices: MANDI_PRICES, sparklines: SPARKLINE_DATA });
}
