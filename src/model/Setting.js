import { model, Schema } from 'mongoose';

const settingSchema = Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    mobile: { type: String, default: '' },
    logo: { type: Schema.Types.ObjectId, ref: 'file', default: null },
    address: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  { versionKey: false, timestamp: false },
);

const Setting = model('setting', settingSchema);
export default Setting;
