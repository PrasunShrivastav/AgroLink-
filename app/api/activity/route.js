import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, data: activities });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const newActivity = await Activity.create(body);
    return NextResponse.json({ success: true, data: newActivity }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
