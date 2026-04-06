import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();

    if (body.advanceStep !== undefined) {
      const order = await Order.findById(params.id);
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

      const stepIndex = body.advanceStep;
      if (stepIndex >= 0 && stepIndex < order.supplyChainSteps.length) {
        order.supplyChainSteps[stepIndex].status = 'complete';
        order.supplyChainSteps[stepIndex].timestamp = new Date();

        if (stepIndex + 1 < order.supplyChainSteps.length) {
          order.supplyChainSteps[stepIndex + 1].status = 'active';
        }

        if (stepIndex === 2) order.status = 'in_progress';
        if (stepIndex === 4) {
          order.status = 'completed';
        }
      }
      await order.save();
      return NextResponse.json(order);
    }

    const order = await Order.findByIdAndUpdate(params.id, body, { new: true });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
