import State from "../model/State.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted"

export const insertState_s = async (args = {}) => {
    let query = State.create(args);
    return await query;
}

export const listState_s = async (args = {}, select = "", populate = [], pagination = false, page = 1, count = 10) => {

    let query = State.find({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();

    if (pagination) {
        query = query.skip((page - 1) * count);
        query = query.limit(count);
    }

    return await query;
}

export const detailState_s = async (args = {}, select = "", populate = []) => {
    let query = State.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}

export const updateState_s = async (args = {}, data = {}) => {
    let query = State.findOneAndUpdate({ ...filter, ...args }, data);
    return await query;
}

export const deleteState_s = async (args = {}) => {
    let query = State.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
    return await query;
}

export const pipelineState_s = async (pipeline = []) => {
    let query = State.aggregate(pipeline);
    return await query;
}
