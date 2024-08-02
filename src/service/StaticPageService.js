import StaticPage from "../model/StaticPage.js";

const filter = { isDeleted: false };
const unselect = "-__v -isDeleted"

export const insertStaticPage_s = async (args = {}) => {
    let query = StaticPage.create(args);
    return await query;
}

export const detailStaticPage_s = async (args = {}, select = "", populate = []) => {
    let query = StaticPage.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}

export const updateStaticPage_s = async (args = {}, data = {}) => {
    let query = StaticPage.findOneAndUpdate({ ...filter, ...args }, data);
    return await query;
}

export const deleteStaticPage_s = async (args = {}) => {
    let query = StaticPage.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
    return await query;
}

export const pipelineStaticPage_s = async (pipeline = []) => {
    let query = StaticPage.aggregate(pipeline);
    return await query;
}