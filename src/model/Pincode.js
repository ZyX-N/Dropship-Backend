import { model, Schema } from 'mongoose';

const pincodeSchema = Schema(
    {
        code: { type: String, index: true },
        city: { type: Schema.Types.ObjectId, ref: "city", index: true, required: true },
        state: { type: Schema.Types.ObjectId, ref: "state", index: true, required: true }
    },
    {
        timestamps: true,
    }
);

const Pincode = model('pincode', pincodeSchema);

export default Pincode;