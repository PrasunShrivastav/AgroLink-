import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Rating from '@/lib/models/Rating';
import Farmer from '@/lib/models/Farmer';
import Buyer from '@/lib/models/Buyer';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const toId = searchParams.get('toId');
    const filter = {};
    if (toId) filter.toId = toId;
    const ratings = await Rating.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(ratings);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const rating = await Rating.create(body);

    const Model = body.fromRole === 'farmer' ? Buyer : Farmer;
    const target = await Model.findById(body.toId);
    if (target) {
      const newTotal = target.totalRatings + 1;
      const newRating = ((target.rating * target.totalRatings) + body.stars) / newTotal;
      target.rating = Math.round(newRating * 10) / 10;
      target.totalRatings = newTotal;
      await target.save();
    }

    return NextResponse.json(rating, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
