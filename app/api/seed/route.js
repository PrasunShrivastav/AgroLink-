import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    const seeded = await seedDatabase();
    return NextResponse.json({ seeded, message: seeded ? 'Database seeded with sample data' : 'Database already has data' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
