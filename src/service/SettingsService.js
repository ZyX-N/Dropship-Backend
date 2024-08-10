import Setting from '../model/Setting.js';

export const insertSetting_s = async (data = {}) => {
  let query = Setting.create(data);
  return await query;
};

export const updateSetting_s = async (args = {}, data = {}) => {
  let query = Setting.findOneAndUpdate(args, data);
  return await query;
};

export const detailSetting_s = async (args = {}, select = '') => {
  let query = Setting.findOne(args).select(select).lean();
  return await query;
};

export const aggregateSetting_s = async (pipeline = []) => {
  let query = Setting.aggregate(pipeline);
  return await query;
};
