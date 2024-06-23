import Category from "../model/Category.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted"

export const insertCategory_s = async (args = {}) => {
    let query = Category.create(args);
    return await query;
}

export const listCategory_s = async (args = {}, select = "", populate = []) => {
    let query = Category.find({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}