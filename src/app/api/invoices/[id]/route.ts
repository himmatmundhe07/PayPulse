import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import mongoose from 'mongoose';

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid invoice ID' }, { status: 400 });
    }
    await connectDB();
    const invoice = await Invoice.findById(id).populate('customer', 'name email address phone');
    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: invoice }, { status: 200 });
  } catch (error) {
    console.error('Fetch invoice error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid invoice ID' }, { status: 400 });
    }
    await connectDB();
    const body = await req.json();

    const existing = await Invoice.findById(id);
    if (!existing) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

    // Only allow editing Draft invoices (status or notes changes are always allowed)
    const updatableFields: Record<string, unknown> = {};

    if (body.status) updatableFields.status = body.status;
    if (body.notes !== undefined) updatableFields.notes = body.notes;
    if (body.dueDate) updatableFields.dueDate = new Date(body.dueDate);

    // Full edit only allowed on Draft invoices
    if (existing.status === 'Draft' && body.lineItems) {
      const computedLineItems = body.lineItems.map((item: { description: string; quantity: number; unitPrice: number }) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.quantity) * Number(item.unitPrice),
      }));
      const subtotal = computedLineItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
      const discPct = Number(body.discountPercent) || 0;
      const taxPct = Number(body.taxPercent) || 0;
      const discountAmount = (subtotal * discPct) / 100;
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * taxPct) / 100;
      const total = afterDiscount + taxAmount;

      Object.assign(updatableFields, {
        lineItems: computedLineItems,
        subtotal,
        discountPercent: discPct,
        discountAmount,
        taxPercent: taxPct,
        taxAmount,
        total,
      });

      if (body.invoiceDate) updatableFields.invoiceDate = new Date(body.invoiceDate);
    }

    const updated = await Invoice.findByIdAndUpdate(id, updatableFields, { new: true, runValidators: true })
      .populate('customer', 'name email address phone');

    return NextResponse.json(
      { success: true, message: 'Invoice updated successfully', data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid invoice ID' }, { status: 400 });
    }
    await connectDB();

    const invoice = await Invoice.findById(id);
    if (!invoice) return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });

    if (invoice.status !== 'Draft') {
      return NextResponse.json(
        { success: false, message: 'Only Draft invoices can be deleted' },
        { status: 400 }
      );
    }

    await Invoice.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete invoice' }, { status: 500 });
  }
}

