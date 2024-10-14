import { sendResponseOk, sendResponseBadReq, tryCatch } from '../../helpers/helper.js';
import { detailProduct_s } from '../../service/ProductService.js';
import { isValidObjectId } from 'mongoose';
import { deleteCart_s, detailCart_s, insertCart_s, listCart_s, updateCart_s } from '../../service/CartService.js';

export const getCart = tryCatch(async (req, res) => {
  let user = req.apiUser;
  const serverPrefix = `${req.protocol}://${req.headers.host}/image/`;

  let list = await listCart_s(
    {
      user: user._id,
    },
    'product createdAt quantity',
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

  return sendResponseOk(res, 'Cart fetched successfully!', list);
});

export const productToCart = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let { product, quantity } = req.body;

  if (!isValidObjectId(product) || !(await detailProduct_s({ _id: product }))) {
    return sendResponseBadReq(res, 'Invalid product!');
  }

  if (
    !(await detailCart_s({
      user: user._id,
      product,
    }))
  ) {
    await insertCart_s({
      user: user._id,
      product,
      quantity,
    });
  } else {
    if (quantity > 0) {
      await updateCart_s(
        { user: user._id, product },
        {
          quantity,
        },
      );
    } else {
      await deleteCart_s({ user: user._id, product });
    }
  }

  return sendResponseOk(res, 'Product update to cart');
});