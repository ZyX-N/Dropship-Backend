import { model, Schema } from 'mongoose';

const stateSchema = Schema(
    {
        name: { type: String, index: true },
        isDeleted: { type: Boolean, index: true, default: false },
    },
    {
        timestamps: true,
    }
);

const State = model('state', stateSchema);

export default State;