import Setting from "../model/Setting.js";

export const detailSetting_s = async (args = {}, select = "") => {
    let query = Setting.findOne(args).select(select).lean();
    return await query;
}