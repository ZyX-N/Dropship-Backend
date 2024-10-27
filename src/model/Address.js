import { model, Schema } from 'mongoose';

const addressSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, index: true, ref: 'user' },
    state: { type: Schema.Types.ObjectId, index: true, ref: 'state' },
    city: { type: Schema.Types.ObjectId, index: true, ref: 'city' },
    area: { type: String, default: '' },
    street: { type: String, default: '' },
    pincode: { type: Schema.Types.ObjectId, index: true, ref: 'pincode' },
    isDeleted: { type: Boolean, index: true, default: false }
  },
  {
    timestamps: true,
  },
);

const Address = model('address', addressSchema);

export default Address;
