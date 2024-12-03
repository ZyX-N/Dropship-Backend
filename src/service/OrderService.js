import Order from '../model/Order.js';

export const insertOrder_s = async (args = {}) => {
  let query = Order.create(args);
  return await query;
};

export const listOrder_s = async (args = {}, select = '', populate = [], pagination = false, page = 1, count = 10) => {
  let query = Order.find(args)
    .populate(populate || [])
    .select(select)
    .lean();

  if (pagination) {
    query = query.skip((page - 1) * count);
    query = query.limit(count);
  }

  return await query;
};

export const countDocOrder_s = async (args = {}) => {
  let query = Order.countDocuments(args);
  return await query;
};

export const detailOrder_s = async (args = {}, select = '', populate = []) => {
  let query = Order.findOne(args)
    .populate(populate || [])
    .select(select)
    .lean();
  return await query;
};

export const updateOrder_s = async (args = {}, data = {}) => {
  let query = Order.findOneAndUpdate(args, data);
  return await query;
};

export const deleteOrder_s = async (args = {}) => {
  let query = Order.findOneAndUpdate(args, { isDeleted: true });
  return await query;
};

export const pipelineOrder_s = async (pipeline = []) => {
  let query = Order.aggregate(pipeline);
  return await query;
};
