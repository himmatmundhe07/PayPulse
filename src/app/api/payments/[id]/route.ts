import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import mongoose from 'mongoose';

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid payment ID' }, { status: 400 });
    }
    await connectDB();
    const payment = await Payment.findById(id)
      .populate('customer', 'name email')
      .populate('invoice', 'invoiceNumber total status');
    if (!payment) return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: payment }, { status: 200 });
  } catch (error) {
    console.error('Fetch payment error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid payment ID' }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    const allowedStatuses = ['Successful', 'Failed', 'Pending'];
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, message: 'Invalid payment status' }, { status: 400 });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
    }

    const previousStatus = payment.status;
    payment.status = body.status;

    if (body.status === 'Successful') {
      payment.paidAt = new Date();
      // Auto-update associated invoice to Paid
      const Invoice = (await import('@/models/Invoice')).default;
      await Invoice.findByIdAndUpdate(payment.invoice, { status: 'Paid' });
    } else if (previousStatus === 'Successful' && body.status !== 'Successful') {
      // Revert invoice back to Pending if no other successful payments exist
      const otherSuccessful = await Payment.findOne({
        invoice: payment.invoice,
        _id: { $ne: payment._id },
        status: 'Successful',
      });
      if (!otherSuccessful) {
        const Invoice = (await import('@/models/Invoice')).default;
        await Invoice.findByIdAndUpdate(payment.invoice, { status: 'Pending' });
      }
    }

    await payment.save();

    const updated = await Payment.findById(id)
      .populate('customer', 'name email')
      .populate('invoice', 'invoiceNumber total status');

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${body.status}`,
      data: updated,
    }, { status: 200 });
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update payment status' }, { status: 500 });
  }
}


