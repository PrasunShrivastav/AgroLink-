import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const buyerId = searchParams.get('buyerId');
    const status = searchParams.get('status');

    const filter = {};
    if (farmerId) filter.farmerId = farmerId;
    if (buyerId) filter.buyerId = buyerId;
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const batchPrefix = body.farmerDistrict ? body.farmerDistrict.substring(0, 3).toUpperCase() : 'AGR';
    const batchId = `${batchPrefix}-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      ...body,
      batchId,
      supplyChainSteps: [
        { label: 'Harvested', status: 'complete', timestamp: new Date() },
        { label: 'Quality Checked', status: 'pending', timestamp: null },
        { label: 'Packed & Loaded', status: 'pending', timestamp: null },
        { label: 'In Transit', status: 'pending', timestamp: null },
        { label: 'Delivered', status: 'pending', timestamp: null },
      ],
    });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
