import { model, Schema } from 'mongoose';

const transactionSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
    orderDbId: { type: Schema.Types.ObjectId, ref: 'order', index: true, require: true },
    orderId: { type: String, index: true, require: true },
    paymentId: { type: String, index: true, default: null },
    amount: { type: Number, index: true, require: true },
    currency: { type: String, index: true, require: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    payment_gateway: { type: String, default: 'Razorpay' },
    // invoice_number: { type: String, index: true, require: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Transaction = model('transaction', transactionSchema);

export default Transaction;
