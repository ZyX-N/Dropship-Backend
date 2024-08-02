import { model, Schema } from 'mongoose';

const staticPageSchema = Schema(
  {
    title: { type: String, index: true, required: true },
    slug: { type: String, index: true, lowercase: true, trim: true },
    logo: { type: Schema.Types.ObjectId, ref: 'file', default: null },
    template: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
  },
  { timestamps: true },
);

const StaticPage = model('static_page', staticPageSchema);
export default StaticPage;
