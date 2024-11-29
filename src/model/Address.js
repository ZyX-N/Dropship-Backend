import { model, Schema } from 'mongoose';

const addressSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, index: true, ref: 'user' },
    name: { type: String, default: '' },
    contact: { type: String, default: '' },
    state: { type: Schema.Types.ObjectId, index: true, ref: 'state' },
    city: { type: Schema.Types.ObjectId, index: true, ref: 'city' },
    house: { type: String, default: '' },
    area: { type: String, default: '' },
    pincode: { type: Schema.Types.ObjectId, index: true, ref: 'pincode' },
    isDeleted: { type: Boolean, index: true, default: false },
  },
  {
    timestamps: true,
  },
);

const Address = model('address', addressSchema);

export default Address;
