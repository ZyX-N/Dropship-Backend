import { model, Schema } from 'mongoose';
// import { randomUUID } from 'crypto';

const orderProductSchema = Schema({
  title: { type: String, index: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'delivered', 'processed', 'dispatched'],
    default: 'pending',
    require: true,
  },
  reason: { type: String, default: null },
  rating: { type: Number },
  adminRating: { type: Number },
  productId: { type: Schema.Types.ObjectId, default: null },
  category: { type: Schema.Types.ObjectId, index: true, ref: 'category' },
  image: { type: [Schema.Types.ObjectId], index: true, ref: 'file', default: [] },
  price: { type: Number, index: true, default: 0 },
  strikePrice: { type: Number, default: 0 },
  amountToPay: { type: Number, index: true, default: 0 },
  quantity: { type: Number, default: 0 },
});

const orderSchema = Schema(
  {
    orderId: { type: String, unique: true, require: true },
    userId: { type: Schema.Types.ObjectId, ref: 'user', index: true, require: true },
    orderFrom: { type: String, enum: ['cart', 'product'], require: true },
    paymentMethod: { type: String, enum: ['cod', 'online'], require: true, index: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid', index: true },
    shippingMethod: { type: String, enum: ['standard', 'free'], require: true },
    isOrderCancelAble: { type: Boolean, index: true, default: true },
    totalMrp: { type: Number, index: true, default: 0 },
    totalPrice: { type: Number, default: 0 },
    shippingAddressId: { type: Schema.Types.ObjectId, ref: 'address', index: true },
    invoiceNo: { type: String, index: true, require: true },
    shippingCost: { type: Number, index: true, default: 0 },
    totalAmountToPay: { type: Number, index: true, default: 0 },
    productDetails: { type: [orderProductSchema], index: true, default: [] },
    transactionDbId: { type: Schema.Types.ObjectId, ref: 'transaction', index: true, default: null },
  },
  {
    timestamps: true,
  },
);

const Order = model('order', orderSchema);

export default Order;
