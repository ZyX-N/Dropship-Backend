import { model, Schema } from 'mongoose';

const userSchema = Schema(
    {
        name: { type: String, index: true },
        email: { type: String, index: true },
        password: { type: String },
        mobile: { type: String, index: true },
        alternateMobile: { type: String, default: null },
        role: { type: Schema.Types.ObjectId, index: true, ref: 'role' },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        createdBy: { type: String, default: null },
        updatedBy: { type: String, default: null },
    },
    { timestamps: true },
);

const User = model('user', userSchema);
export default User;