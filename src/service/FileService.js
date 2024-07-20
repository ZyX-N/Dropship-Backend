import File from "../model/File.js";

export const insertFile_s = async (args = {}) => {
    let query = File.create(args);
    return await query;
}

export const listFile_s = async (args = {}, select = "") => {
    let query = File.find({ ...args }).select(select).lean();
    return await query;
}

export const detailFile_s = async (args = {}, select = "") => {
    let query = File.findOne({ ...args }).select(select).lean();
    return await query;
}