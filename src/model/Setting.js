import { model, Schema } from 'mongoose';

const settingSchema = Schema(
    {
        name: { type: String },
        logo: { type: String },
        instagram: { type: String },
        facebook: { type: String },
    },
    { versionKey: false },
);

const Setting = model('setting', settingSchema);
export default Setting;