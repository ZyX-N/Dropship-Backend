import { sendResponseOk, sendResponseBadReq, tryCatch } from '../../helpers/helper.js';
import { detailProduct_s } from '../../service/ProductService.js';
import { isValidObjectId } from 'mongoose';
import { deleteWishlist_s, detailWishlist_s, insertWishlist_s, listWishlist_s } from '../../service/WishlistService.js';

export const getWishlist = tryCatch(async (req, res) => {
  let user = req.apiUser;
  const serverPrefix = `${req.protocol}://${req.headers.host}/image/`;

  let list = await listWishlist_s(
    {
      user: user._id,
    },
    'product createdAt',
    [
      {
        path: 'product',
        select: 'category image price rating stock slug strikePrice title',
        populate: [
          {
            path: 'category',
            select: 'title',
            match: { isDeleted: false, isActive: true },
          },
          { path: 'image', select: 'filename' },
        ],
        match: { isDeleted: false, isActive: true },
      },
    ],
  );

  if (list.length > 0) {
    list = list?.map((item) => {
      if (item?.product && item?.product?.image.length > 0) {
        for (let img of item.product.image) {
          let tempImg = `${serverPrefix}${img.filename}`;
          img.url = tempImg;
        }
      }
      return item;
    });
  }

  return sendResponseOk(res, 'Wishlist fetched successfully!', list);
});

export const productToWishlist = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let { productId } = req.params;

  if (!isValidObjectId(productId) || !(await detailProduct_s({ _id: productId }))) {
    return sendResponseBadReq(res, 'Invalid product!');
  }

  if (
    !(await detailWishlist_s({
      user: user._id,
      product: productId,
    }))
  ) {
    await insertWishlist_s({
      user: user._id,
      product: productId,
    });
  }

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
