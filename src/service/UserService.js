import User from "../model/User.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted -__v"

export const detailUser_s = async (args = {}, select = "", populate = []) => {
    let query = User.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}