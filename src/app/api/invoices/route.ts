import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import mongoose from 'mongoose';

// Generate unique invoice number
async function generateInvoiceNumber(): Promise<string> {
  const count = await Invoice.countDocuments();
  const num = String(count + 1).padStart(4, '0');
  return `INV-${num}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: invoices }, { status: 200 });
  } catch (error) {
    console.error('Fetch invoices error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { customerId, lineItems, discountPercent, taxPercent, invoiceDate, dueDate, notes } = body;

    if (!customerId || !lineItems || !invoiceDate || !dueDate) {
      return NextResponse.json(
        { success: false, message: 'Customer, line items, invoice date and due date are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json({ success: false, message: 'Invalid customer ID' }, { status: 400 });
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({ success: false, message: 'At least one line item is required' }, { status: 400 });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });

    // Recalculate totals on backend (do not trust frontend values)
    const computedLineItems = lineItems.map((item: { description: string; quantity: number; unitPrice: number }) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
    }));

    const subtotal = computedLineItems.reduce((sum, item) => sum + item.total, 0);
    const discPct = Number(discountPercent) || 0;
    const taxPct = Number(taxPercent) || 0;
    const discountAmount = (subtotal * discPct) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * taxPct) / 100;
    const total = afterDiscount + taxAmount;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      customer: customerId,
      lineItems: computedLineItems,
      subtotal,
      discountPercent: discPct,
      discountAmount,
      taxPercent: taxPct,
      taxAmount,
      total,
      status: body.status || 'Draft',
      invoiceDate: new Date(invoiceDate),
      dueDate: new Date(dueDate),
      notes: notes || '',
    });

    const populated = await invoice.populate('customer', 'name email');

    return NextResponse.json(
      { success: true, message: 'Invoice created successfully', data: populated },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create invoice' }, { status: 500 });
  }
}

