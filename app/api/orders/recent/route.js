import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    if (!farmerId) return NextResponse.json({ error: 'farmerId missing' }, { status: 400 });

    const orders = await Order.find({ farmerId }).sort({ createdAt: -1 }).limit(3);
    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
