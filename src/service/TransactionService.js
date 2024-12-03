import Transaction from '../model/Transaction.js';

const filter = { isDeleted: false };
const unselect = ' -isDeleted';

export const insertTransaction_s = async (args = {}) => {
  let query = Transaction.create(args);
  return await query;
};

export const listTransaction_s = async (args = {}, select = '', populate = [], pagination = false, page = 1, count = 10) => {
  let query = Transaction.find({ ...filter, ...args })
    .populate(populate || [])
    .select(select || unselect)
    .lean();

  if (pagination) {
    query = query.skip((page - 1) * count);
    query = query.limit(count);
  }

  return await query;
};

export const detailTransaction_s = async (args = {}, select = '', populate = []) => {
  let query = Transaction.findOne({ ...filter, ...args })
    .populate(populate || [])
    .select(select || unselect)
    .lean();
  return await query;
};

export const updateTransaction_s = async (args = {}, data = {}) => {
  let query = Transaction.findOneAndUpdate({ ...filter, ...args }, data);
  return await query;
};

export const deleteTransaction_s = async (args = {}) => {
  let query = Transaction.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
  return await query;
};

export const pipelineTransaction_s = async (pipeline = []) => {
  let query = Transaction.aggregate(pipeline);
  return await query;
};
