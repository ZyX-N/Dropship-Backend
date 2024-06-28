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

export const detailCategory_s = async (args = {}, select = "", populate = []) => {
    let query = Category.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}

export const updateCategory_s = async (args = {}, data = {}) => {
    let query = Category.updateOne({ ...filter, ...args }, { $set: data });
    return await query;
}

export const deleteCategory_s = async (args = {}) => {
    let query = Category.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
    return await query;
}