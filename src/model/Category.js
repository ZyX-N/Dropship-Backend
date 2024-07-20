import { model, Schema } from 'mongoose';

const categorySchema = Schema(
    {
        title: { type: String, index: true },
        slug: { type: String, index: true },
        image: { type: Schema.Types.ObjectId, ref: "file", default: null },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
    },
    { timestamps: true },
);

const Category = model('category', categorySchema);
export default Category;