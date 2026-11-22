import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Cancelled', 'Past Due'],
      default: 'Active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextBillingDate: {
      type: Date,
      required: true,
    },
    // Snapshot of price at time of subscription (in case product price changes)
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Yearly', 'One-time'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

