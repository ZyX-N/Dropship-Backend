import Role from "../model/Role.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted"

export const detailRole_s = async (args = {}, select = "", populate = []) => {
    let query = Role.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}