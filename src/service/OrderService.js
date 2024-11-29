import Order from "../model/Order.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted"

export const insertOrder_s = async (args = {}) => {
    let query = Order.create(args);
    return await query;
}

export const listOrder_s = async (args = {}, select = "", populate = [], pagination = false, page = 1, count = 10) => {

    let query = Order.find({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();

    if (pagination) {
        query = query.skip((page - 1) * count);
        query = query.limit(count);
    }

    return await query;
}

export const detailOrder_s = async (args = {}, select = "", populate = []) => {
    let query = Order.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}

export const updateOrder_s = async (args = {}, data = {}) => {
    let query = Order.findOneAndUpdate({ ...filter, ...args }, data);
    return await query;
}

export const deleteOrder_s = async (args = {}) => {
    let query = Order.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
    return await query;
}

export const pipelineOrder_s = async (pipeline = []) => {
    let query = Order.aggregate(pipeline);
    return await query;
}
