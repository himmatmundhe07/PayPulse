import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import mongoose from 'mongoose';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response('Invalid invoice ID', { status: 400 });
    }
    await connectDB();

    const invoice = await Invoice.findById(id).populate('customer', 'name email address phone');
    if (!invoice) return new Response('Invoice not found', { status: 404 });

    const customer = invoice.customer as {
      name: string;
      email: string;
      address: string;
      phone: string;
    };

    // Build PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const blue = rgb(0.145, 0.388, 0.922);
    const dark = rgb(0.1, 0.1, 0.1);
    const gray = rgb(0.45, 0.45, 0.45);
    const lightGray = rgb(0.9, 0.9, 0.9);

    // Header background
    page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: blue });

    // PayPulse branding
    page.drawText('PayPulse', { x: 40, y: height - 45, size: 28, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Billing & Subscription Management', { x: 40, y: height - 65, size: 10, font: fontReg, color: rgb(0.85, 0.9, 1) });

    // Invoice title
    page.drawText('INVOICE', { x: width - 160, y: height - 45, size: 24, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(`#${invoice.invoiceNumber}`, { x: width - 160, y: height - 65, size: 11, font: fontReg, color: rgb(0.85, 0.9, 1) });

    // Invoice metadata
    let y = height - 120;
    const col2 = width - 200;

    page.drawText('Bill To:', { x: 40, y, size: 10, font: fontBold, color: gray });
    page.drawText('Invoice Details:', { x: col2, y, size: 10, font: fontBold, color: gray });
    y -= 16;

    page.drawText(customer.name, { x: 40, y, size: 12, font: fontBold, color: dark });
    page.drawText(`Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, { x: col2, y, size: 10, font: fontReg, color: dark });
    y -= 14;

    page.drawText(customer.email, { x: 40, y, size: 10, font: fontReg, color: gray });
    page.drawText(`Due Date:         ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, { x: col2, y, size: 10, font: fontReg, color: dark });
    y -= 14;

    page.drawText(customer.phone || '', { x: 40, y, size: 10, font: fontReg, color: gray });
    page.drawText(`Status:              ${invoice.status}`, { x: col2, y, size: 10, font: fontReg, color: dark });
    y -= 14;

    const addressLines = (customer.address || '').split(',');
    for (const line of addressLines) {
      page.drawText(line.trim(), { x: 40, y, size: 10, font: fontReg, color: gray });
      y -= 14;
    }

    // Divider
    y -= 10;
    page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: lightGray });
    y -= 20;

    // Table header
    page.drawRectangle({ x: 40, y: y - 4, width: width - 80, height: 20, color: rgb(0.95, 0.96, 0.98) });
    page.drawText('Description', { x: 50, y, size: 10, font: fontBold, color: dark });
    page.drawText('Qty', { x: 340, y, size: 10, font: fontBold, color: dark });
    page.drawText('Unit Price', { x: 390, y, size: 10, font: fontBold, color: dark });
    page.drawText('Total', { x: 480, y, size: 10, font: fontBold, color: dark });
    y -= 24;

    // Line items
    for (const item of invoice.lineItems) {
      page.drawText(String(item.description).substring(0, 45), { x: 50, y, size: 10, font: fontReg, color: dark });
      page.drawText(String(item.quantity), { x: 340, y, size: 10, font: fontReg, color: dark });
      page.drawText(`$${Number(item.unitPrice).toFixed(2)}`, { x: 390, y, size: 10, font: fontReg, color: dark });
      page.drawText(`$${Number(item.total).toFixed(2)}`, { x: 480, y, size: 10, font: fontReg, color: dark });
      y -= 18;
      page.drawLine({ start: { x: 40, y: y + 2 }, end: { x: width - 40, y: y + 2 }, thickness: 0.3, color: lightGray });
    }

    // Totals
    y -= 20;
    const totX = 380;
    const valX = 490;

    const drawTotal = (label: string, value: string, bold = false) => {
      page.drawText(label, { x: totX, y, size: 10, font: bold ? fontBold : fontReg, color: bold ? dark : gray });
      page.drawText(value, { x: valX, y, size: 10, font: bold ? fontBold : fontReg, color: bold ? dark : gray });
      y -= 16;
    };

    drawTotal('Subtotal:', `$${Number(invoice.subtotal).toFixed(2)}`);
    if (invoice.discountPercent > 0) {
      drawTotal(`Discount (${invoice.discountPercent}%):`, `-$${Number(invoice.discountAmount).toFixed(2)}`);
    }
    if (invoice.taxPercent > 0) {
      drawTotal(`Tax (${invoice.taxPercent}%):`, `$${Number(invoice.taxAmount).toFixed(2)}`);
    }
    page.drawLine({ start: { x: totX, y: y + 8 }, end: { x: width - 40, y: y + 8 }, thickness: 0.5, color: dark });
    y -= 4;
    drawTotal('TOTAL:', `$${Number(invoice.total).toFixed(2)}`, true);

    if (invoice.notes) {
      y -= 20;
      page.drawText('Notes:', { x: 40, y, size: 10, font: fontBold, color: gray });
      y -= 14;
      page.drawText(invoice.notes, { x: 40, y, size: 10, font: fontReg, color: gray });
    }

    // Footer
    page.drawLine({ start: { x: 40, y: 50 }, end: { x: width - 40, y: 50 }, thickness: 0.5, color: lightGray });
    page.drawText('Thank you for your business! | PayPulse – Billing & Subscription Management', {
      x: 40, y: 35, size: 9, font: fontReg, color: gray,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate PDF' }, { status: 500 });
  }
}

