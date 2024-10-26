import City from "../model/City.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted"

export const insertCity_s = async (args = {}) => {
    let query = City.create(args);
    return await query;
}

export const listCity_s = async (args = {}, select = "", populate = [], pagination = false, page = 1, count = 10) => {

    let query = City.find({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();

    if (pagination) {
        query = query.skip((page - 1) * count);
        query = query.limit(count);
    }

    return await query;
}

export const detailCity_s = async (args = {}, select = "", populate = []) => {
    let query = City.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}

export const updateCity_s = async (args = {}, data = {}) => {
    let query = City.findOneAndUpdate({ ...filter, ...args }, data);
    return await query;
}

export const deleteCity_s = async (args = {}) => {
    let query = City.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
    return await query;
}

export const pipelineCity_s = async (pipeline = []) => {
    let query = City.aggregate(pipeline);
    return await query;
}
