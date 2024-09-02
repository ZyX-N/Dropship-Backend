import Wishlist from '../model/wishlist.js';

export const insertWishlist_s = async (args = {}) => {
  let query = Wishlist.create(args);
  return await query;
};

export const listWishlist_s = async (args = {}, select = '', populate = []) => {
  let query = Wishlist.find(args)
    .populate(populate || [])
    .select(select)
    .lean();
  return await query;
};

export const detailWishlist_s = async (args = {}, select = '', populate = []) => {
  let query = Wishlist.findOne(args)
    .populate(populate || [])
    .select(select)
    .lean();
  return await query;
};

export const updateWishlist_s = async (args = {}, data = {}) => {
  let query = Wishlist.findOneAndUpdate(args, data);
  return await query;
};

export const deleteWishlist_s = async (args = {}) => {
  let query = Wishlist.deleteOne(args);
  return await query;
};

export const pipelineWishlist_s = async (pipeline = []) => {
  let query = Wishlist.aggregate(pipeline);
  return await query;
};
