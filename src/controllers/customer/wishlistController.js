import { sendResponseOk, sendResponseBadReq, tryCatch } from '../../helpers/helper.js';
import { detailProduct_s } from '../../service/ProductService.js';
import { isValidObjectId } from 'mongoose';
import { deleteWishlist_s, insertWishlist_s, listWishlist_s } from '../../service/WishlistService.js';

export const getWishlist = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let list = await listWishlist_s({
    user: user._id,
  });

  return sendResponseOk(res, 'Wishlist fetched successfully!', list);
});

export const productToWishlist = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let { productId } = req.params;

  if (!isValidObjectId(productId) || !(await detailProduct_s({ _id: productId }))) {
    return sendResponseBadReq(res, 'Invalid product!');
  }

  await insertWishlist_s({
    user: user._id,
    product: productId,
  });

  return sendResponseOk(res, 'Product added to wishlist');
});

export const removeProductFromWishlist = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let { productId } = req.params;

  if (!isValidObjectId(productId) || !(await detailProduct_s({ _id: productId }))) {
    return sendResponseBadReq(res, 'Invalid product!');
  }

  await deleteWishlist_s({
    user: user._id,
    product: productId,
  });

  return sendResponseOk(res, 'Product removed from wishlist successfully!');
});
