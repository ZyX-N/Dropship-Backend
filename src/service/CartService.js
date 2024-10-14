import Cart from '../model/Cart.js';

export const insertCart_s = async (args = {}) => {
  let query = Cart.create(args);
  return await query;
};

export const listCart_s = async (args = {}, select = '', populate = []) => {
  let query = Cart.find(args)
    .populate(populate || [])
    .select(select)
    .lean();
  return await query;
};

export const detailCart_s = async (args = {}, select = '', populate = []) => {
  let query = Cart.findOne(args)
    .populate(populate || [])
    .select(select)
    .lean();
  return await query;
};

export const updateCart_s = async (args = {}, data = {}) => {
  let query = Cart.findOneAndUpdate(args, data);
  return await query;
};

export const deleteCart_s = async (args = {}) => {
  let query = Cart.deleteOne(args);
  return await query;
};

export const pipelineCart_s = async (pipeline = []) => {
  let query = Cart.aggregate(pipeline);
  return await query;
};
