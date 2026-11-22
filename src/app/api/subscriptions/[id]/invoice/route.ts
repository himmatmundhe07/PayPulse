import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import Invoice from '@/models/Invoice';
import mongoose from 'mongoose';

type Props = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid subscription ID' }, { status: 400 });
    }

    await connectDB();

    const sub = await Subscription.findById(id)
      .populate('customer', 'name email')
      .populate('product', 'name price billingCycle');

    if (!sub) {
      return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    }

    // Generate unique sequential invoice number
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const invoiceNumber = `INV-${String(nextNum).padStart(4, '0')}`;

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 14);

    const productName = (sub.product as { name?: string })?.name || 'Subscription';
    const unitPrice = sub.price;

    const lineItems = [
      {
        description: `${productName} (${sub.billingCycle} Recurring Subscription)`,
        quantity: 1,
        unitPrice,
        total: unitPrice,
      },
    ];

    const invoice = await Invoice.create({
      invoiceNumber,
      customer: sub.customer._id,
      lineItems,
      subtotal: unitPrice,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: unitPrice,
      status: 'Pending',
      invoiceDate: now,
      dueDate,
      notes: `Generated for ${sub.billingCycle} subscription (${productName}).`,
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice,
    }, { status: 201 });
  } catch (error) {
    console.error('Generate subscription invoice error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate invoice' }, { status: 500 });
  }
}

