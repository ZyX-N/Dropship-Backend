import { model, Schema } from 'mongoose';

const wishlistSchema = Schema(
  {
    product: { type: Schema.Types.ObjectId, index: true, ref: 'product' },
    user: { type: Schema.Types.ObjectId, index: true, ref: 'user' },
  },
  {
    timestamps: true,
  },
);

const Wishlist = model('wishlist', wishlistSchema);

export default Wishlist;
