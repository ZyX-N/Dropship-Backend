import Role from "../../src/model/Role.js";
import User from "../../src/model/User.js";
import { hashPassword } from "../../src/helpers/helper.js"

export const createUser = async (data) => {
    try {
        const roleInfo = await Role.findOne({ title: 'admin', isDeleted: false }).lean();
        if (!roleInfo) {
            console.log(`Role not available!`);
            return null;
        }

        const userInfo = await User.find({ isDeleted: false }).lean();
        if (userInfo.length > 0) {
            console.log(`User already exists!`);
            return null;
        }

        await User.create({
            name: data.name,
            email: data.email,
            password: await hashPassword(data.password),
            mobile: data.mobile,
            alternateMobile: null,
            role: roleInfo._id,
            type: roleInfo.title,
            isVerified: true
        });
        console.log(`User created successfully!`);
    } catch (error) {
        console.log(error);
        return null;
    }
};