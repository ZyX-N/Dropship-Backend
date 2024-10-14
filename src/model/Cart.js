import { model, Schema } from 'mongoose';

const cartSchema = Schema(
  {
    product: { type: Schema.Types.ObjectId, index: true, ref: 'product' },
    user: { type: Schema.Types.ObjectId, index: true, ref: 'user' },
    quantity: { type: Number, default: 1, min: 1 },
  },
  {
    timestamps: true,
  },
);

const Cart = model('cart', cartSchema);
export default Cart;