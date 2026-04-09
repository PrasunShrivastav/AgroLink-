import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';

export async function PATCH(request) {
  try {
    await dbConnect();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await Activity.updateMany({ userId, read: false }, { $set: { read: true } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
