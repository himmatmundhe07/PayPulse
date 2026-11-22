import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import mongoose from 'mongoose';

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid subscription ID' }, { status: 400 });
    }
    await connectDB();
    const sub = await Subscription.findById(id)
      .populate('customer', 'name email')
      .populate('product', 'name billingCycle');
    if (!sub) return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: sub }, { status: 200 });
  } catch (error) {
    console.error('Fetch subscription error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid subscription ID' }, { status: 400 });
    }
    await connectDB();
    const body = await req.json();

    const allowedStatuses = ['Active', 'Paused', 'Cancelled', 'Past Due'];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const existing = await Subscription.findById(id);
    if (!existing) return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });

    // Business rules: Can't reactivate a Cancelled subscription
    if (existing.status === 'Cancelled' && body.status === 'Active') {
      return NextResponse.json(
        { success: false, message: 'Cancelled subscriptions cannot be reactivated. Create a new subscription.' },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {};
    if (body.status) {
      updateFields.status = body.status;
    }

    // Support plan upgrade / downgrade
    if (body.productId && body.productId !== existing.product.toString()) {
      if (!mongoose.Types.ObjectId.isValid(body.productId)) {
        return NextResponse.json({ success: false, message: 'Invalid product ID' }, { status: 400 });
      }
      const Product = (await import('@/models/Product')).default;
      const newProduct = await Product.findById(body.productId);
      if (!newProduct) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
      }
      if (newProduct.status !== 'Active') {
        return NextResponse.json({ success: false, message: 'Cannot switch to an inactive product' }, { status: 400 });
      }

      updateFields.product = newProduct._id;
      updateFields.price = newProduct.price;
      updateFields.billingCycle = newProduct.billingCycle;
    }

    const updated = await Subscription.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('customer', 'name email')
      .populate('product', 'name billingCycle');

    return NextResponse.json(
      { success: true, message: 'Subscription updated successfully', data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid subscription ID' }, { status: 400 });
    }
    await connectDB();
    const sub = await Subscription.findByIdAndDelete(id);
    if (!sub) return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Subscription deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete subscription' }, { status: 500 });
  }
}

