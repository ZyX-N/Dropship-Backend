import { model, Schema } from 'mongoose';

const fileSchema = Schema(
    {
        path: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
    },
    { timestamps: true },
);

const File = model('file', fileSchema);
export default File;