import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/lib/models/Listing';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const listing = await Listing.findById(params.id);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    return NextResponse.json(listing);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const listing = await Listing.findByIdAndUpdate(params.id, body, { new: true });
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    return NextResponse.json(listing);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
