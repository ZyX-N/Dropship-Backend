import Pincode from "../model/Pincode.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted"

export const insertPincode_s = async (args = {}) => {
    let query = Pincode.create(args);
    return await query;
}

export const listPincode_s = async (args = {}, select = "", populate = [], pagination = false, page = 1, count = 10) => {

    let query = Pincode.find({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();

    if (pagination) {
        query = query.skip((page - 1) * count);
        query = query.limit(count);
    }

    return await query;
}

export const detailPincode_s = async (args = {}, select = "", populate = []) => {
    let query = Pincode.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}

export const updatePincode_s = async (args = {}, data = {}) => {
    let query = Pincode.findOneAndUpdate({ ...filter, ...args }, data);
    return await query;
}

export const deletePincode_s = async (args = {}) => {
    let query = Pincode.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
    return await query;
}

export const pipelinePincode_s = async (pipeline = []) => {
    let query = Pincode.aggregate(pipeline);
    return await query;
}
