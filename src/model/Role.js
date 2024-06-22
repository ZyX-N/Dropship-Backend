import { model, Schema } from 'mongoose';

const roleSchema = Schema(
  {
    title: { type: String, index: true },
    isDeleted: { type: Boolean, default: false },
  },
  { versionKey: false },
);

const Role = model('role', roleSchema);

export default Role;