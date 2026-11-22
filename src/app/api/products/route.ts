import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || body.price === undefined || !body.billingCycle) {
      return NextResponse.json(
        { success: false, message: 'Name, price, and billing cycle are required' },
        { status: 400 }
      );
    }

    if (typeof body.price !== 'number' || body.price < 0) {
      return NextResponse.json(
        { success: false, message: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name: body.name,
      description: body.description || '',
      price: body.price,
      billingCycle: body.billingCycle,
      status: body.status || 'Active',
    });

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data: product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 });
  }
}

