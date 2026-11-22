import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Card (Simulated)'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Successful', 'Failed', 'Pending'],
      default: 'Pending',
    },
    reference: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;

