import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) filter.customer = customerId;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('customer', 'name email')
      .populate('invoice', 'invoiceNumber total status')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: payments }, { status: 200 });
  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { customerId, invoiceId, amount, paymentMethod, status, reference, notes } = body;

    if (!customerId || !invoiceId || !amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Customer, invoice, amount, and payment method are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(customerId) || !mongoose.Types.ObjectId.isValid(invoiceId)) {
      return NextResponse.json({ success: false, message: 'Invalid customer or invoice ID' }, { status: 400 });
    }

    const [customer, invoice] = await Promise.all([
      Customer.findById(customerId),
      Invoice.findById(invoiceId),
    ]);

    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

    // Prevent duplicate successful payments for same invoice
    if (status === 'Successful' || !status) {
      const existingSuccessful = await Payment.findOne({ invoice: invoiceId, status: 'Successful' });
      if (existingSuccessful) {
        return NextResponse.json(
          { success: false, message: 'This invoice has already been paid successfully' },
          { status: 409 }
        );
      }
    }

    const paymentStatus = status || 'Successful';
    const paidAt = paymentStatus === 'Successful' ? new Date() : undefined;

    const payment = await Payment.create({
      customer: customerId,
      invoice: invoiceId,
      amount: Number(amount),
      paymentMethod,
      status: paymentStatus,
      reference: reference || '',
      notes: notes || '',
      paidAt,
    });

    // If successful, mark invoice as Paid
    if (paymentStatus === 'Successful') {
      await Invoice.findByIdAndUpdate(invoiceId, { status: 'Paid' });
    }

    const populated = await payment.populate([
      { path: 'customer', select: 'name email' },
      { path: 'invoice', select: 'invoiceNumber total status' },
    ]);

    return NextResponse.json(
      { success: true, message: 'Payment recorded successfully', data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ success: false, message: 'Failed to record payment' }, { status: 500 });
  }
}

