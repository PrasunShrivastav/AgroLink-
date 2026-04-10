import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/lib/models/Listing';
import Order from '@/lib/models/Order';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    if (!farmerId) return NextResponse.json({ error: 'farmerId missing' }, { status: 400 });

    const listings = await Listing.find({ farmerId });
    const orders = await Order.find({ farmerId });

    const activeListings = listings.filter(l => ['active','bid_received','negotiating'].includes(l.status)).length;
    const pendingOrders  = orders.filter(o => ['confirmed', 'pending'].includes(o.status)).length;
    const completedSales = orders.filter(o => o.status === 'completed').length;
    const totalEarnings  = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + ((o.totalAmount) || (o.quantity * o.agreedPrice)), 0);

    return NextResponse.json({ activeListings, pendingOrders, completedSales, totalEarnings });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
