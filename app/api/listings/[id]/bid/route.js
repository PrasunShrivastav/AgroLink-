import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/lib/models/Listing';
import { addActivity } from '@/lib/activityServer';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const listing = await Listing.findById(params.id);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

    listing.bids.push(body);
    if (listing.status === 'active') listing.status = 'bid_received';
    await listing.save();

    const newBid = listing.bids[listing.bids.length - 1];

    await addActivity({
      userId:  listing.farmerId,
      role:    'farmer',
      type:    'bid_received',
      message: `${body.buyerName} placed a bid of ₹${body.offeredPrice}/q on your ${listing.crop} listing`,
      meta:    { listingId: listing._id, bidId: newBid._id, offeredPrice: body.offeredPrice, crop: listing.crop }
    });

    await addActivity({
      userId:  body.buyerId,
      role:    'buyer',
      type:    'bid_placed',
      message: `Your offer of ₹${body.offeredPrice}/q for ${listing.crop} from ${listing.farmerName} has been sent`,
      meta:    { listingId: listing._id, bidId: newBid._id, offeredPrice: body.offeredPrice, crop: listing.crop }
    });

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

    if (action === 'accept') {
      await addActivity({
        userId:  listing.farmerId,
        role:    'farmer',
        type:    'order_confirmed',
        message: `Order confirmed with ${bid.buyerName} for ${bid.quantity}q of ${listing.crop} at ₹${bid.offeredPrice}/q`,
        meta:    { crop: listing.crop, qty: bid.quantity, agreedPrice: bid.offeredPrice }
      });
      await addActivity({
        userId:  bid.buyerId,
        role:    'buyer',
        type:    'bid_accepted',
        message: `${listing.farmerName} accepted your offer of ₹${bid.offeredPrice}/q for ${listing.crop}. Order is confirmed`,
        meta:    { crop: listing.crop, agreedPrice: bid.offeredPrice }
      });
    }

    return NextResponse.json(listing);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
