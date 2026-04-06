import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/lib/models/Listing';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const listing = await Listing.findById(params.id);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    listing.bids.push(body);
    if (listing.status === 'active') listing.status = 'bid_received';
    await listing.save();
    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { bidId, action, counterPrice } = await request.json();
    const listing = await Listing.findById(params.id);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    const bid = listing.bids.id(bidId);
    if (!bid) return NextResponse.json({ error: 'Bid not found' }, { status: 404 });

    if (action === 'accept') {
      bid.status = 'accepted';
      listing.status = 'sold';
    } else if (action === 'counter') {
      bid.status = 'countered';
      bid.counterPrice = counterPrice;
    } else if (action === 'reject') {
      bid.status = 'rejected';
    }

    await listing.save();
    return NextResponse.json(listing);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
