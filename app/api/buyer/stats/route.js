import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    if (!buyerId) return NextResponse.json({ error: 'buyerId missing' }, { status: 400 });

    const orders = await Order.find({ buyerId });

    const activeOrders    = orders.filter(o => ['confirmed','in_progress'].includes(o.status)).length;
    const pendingDelivery = orders.filter(o => o.status === 'in_progress').length;
    const completed       = orders.filter(o => ['delivered', 'completed'].includes(o.status)).length;
    const totalSpent      = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + ((o.totalAmount) || (o.quantity * o.agreedPrice)), 0);

    return NextResponse.json({ activeOrders, pendingDelivery, completed, totalSpent });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
