import { model, Schema } from 'mongoose';

const citySchema = Schema(
    {
        name: { type: String, index: true },
        state: { type: Schema.Types.ObjectId, ref: "state", index: true, required: true }
    },
    {
        timestamps: true,
    }
);

const City = model('city', citySchema);

export default City;