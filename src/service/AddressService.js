import Address from '../model/Address.js';

export const insertAddress_s = async (args = {}) => {
  let query = Address.create(args);
  return await query;
};

export const listAddress_s = async (args = {}, select = '', populate = []) => {
  let query = Address.find(args)
    .populate(populate || [])
    .select(select)
    .lean();
  return await query;
};

export const detailAddress_s = async (args = {}, select = '', populate = []) => {
  let query = Address.findOne(args)
    .populate(populate || [])
    .select(select)
    .lean();
  return await query;
};

export const updateAddress_s = async (args = {}, data = {}) => {
  let query = Address.findOneAndUpdate(args, data);
  return await query;
};

export const deleteAddress_s = async (args = {}) => {
  let query = Address.deleteOne(args);
  return await query;
};

export const pipelineAddress_s = async (pipeline = []) => {
  let query = Address.aggregate(pipeline);
  return await query;
};
