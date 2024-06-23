import User from "../model/User.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted -__v"

export const insertUser_s = async (args = {}) => {
    let query = User.create(args);
    return await query;
}

export const detailUser_s = async (args = {}, select = "", populate = []) => {
    let query = User.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}