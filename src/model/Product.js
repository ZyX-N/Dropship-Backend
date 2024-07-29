import { model, Schema } from 'mongoose';

const productSchema = Schema(
    {
        title: { type: String, index: true },
        hindiTitle: { type: String, index: true },
        description: { type: String },
        hindiDescription: { type: String },
        slug: { type: String, index: true, lowercase: true, trim: true },
        image: { type: [Schema.Types.ObjectId], ref: 'file', default: [] },
        category: { type: Schema.Types.ObjectId, ref: 'category', required: true },
        strikePrice: { type: Number, default: 0 },
        price: { type: Number, default: 0, index: true },
        stock: { type: Number, default: 0 },
        rating: { type: Number, min: 0, max: 5, default: 5 },
        adminRating: { type: Number, min: 0, max: 5, default: null },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
    },
    { timestamps: true },
);

const Product = model('product', productSchema);
export default Product;