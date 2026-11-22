import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const subscriptions = await Subscription.find()
      .populate('customer', 'name email')
      .populate('product', 'name billingCycle')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: subscriptions }, { status: 200 });
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { customerId, productId, startDate } = body;

    if (!customerId || !productId || !startDate) {
      return NextResponse.json(
        { success: false, message: 'Customer, product, and start date are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(customerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, message: 'Invalid customer or product ID' }, { status: 400 });
    }

    const [customer, product] = await Promise.all([
      Customer.findById(customerId),
      Product.findById(productId),
    ]);

    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    if (product.status !== 'Active') {
      return NextResponse.json({ success: false, message: 'Cannot subscribe to an inactive product' }, { status: 400 });
    }

    // Calculate next billing date
    const start = new Date(startDate);
    let nextBillingDate: Date;
    if (product.billingCycle === 'Monthly') {
      nextBillingDate = new Date(start);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (product.billingCycle === 'Yearly') {
      nextBillingDate = new Date(start);
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      // One-time
      nextBillingDate = new Date(start);
    }

    const subscription = await Subscription.create({
      customer: customerId,
      product: productId,
      startDate: start,
      nextBillingDate,
      price: product.price,
      billingCycle: product.billingCycle,
      status: 'Active',
    });

    const populated = await subscription.populate([
      { path: 'customer', select: 'name email' },
      { path: 'product', select: 'name billingCycle' },
    ]);

    return NextResponse.json(
      { success: true, message: 'Subscription created successfully', data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create subscription' }, { status: 500 });
  }
}

