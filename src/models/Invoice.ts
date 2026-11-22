import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    lineItems: {
      type: [lineItemSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length > 0,
        message: 'Invoice must have at least one line item',
      },
    },
    subtotal: { type: Number, required: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0, min: 0, max: 100 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Paid', 'Overdue'],
      default: 'Draft',
    },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Invoice =
  mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);

export default Invoice;

