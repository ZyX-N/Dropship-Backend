import { isValidObjectId } from 'mongoose';
import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import Wishlist from '../../models/Wishlist.js';

export const addProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    let checkExist = await Wishlist.findOne({ product: req.body.product, user: user._id });

    if (checkExist) {
      return sendResponseWithoutData(res, 400, false, 'Product already in wishlist');
    }

    let wishProduct = await Wishlist.create({
      product: req.body.product,
      user: user._id,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (wishProduct) {
      return sendResponseWithoutData(res, 200, true, 'Product added to wishlist');
    }

    return sendResponseWithoutData(res, 400, false, 'Product failed to add in wishlist');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const addMultipleProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    if (req.body.product && req.body.product.length > 0) {
      for (const pro of req.body.product) {
        if (isValidObjectId(pro) && !(await Wishlist.findOne({ product: pro, user: user._id }))) {
          await Wishlist.create({
            product: pro,
            user: user._id,
            createdBy: user._id,
            updatedBy: user._id,
          });
        }
      }
    } else {
      return sendResponseWithoutData(res, 400, false, 'Atleast provide one product to add in wishlist!');
    }

    return sendResponseWithoutData(res, 200, true, 'Product added to wishlist');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const listProduct = async (req, res) => {
  try {
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let wishProduct = await Wishlist.find({ user: user._id })
      .populate({
        path: 'product',
        select:
          '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
        populate: [
          {
            path: 'image',
            select: '_id url',
          },
          {
            path: 'category',
            select: '_id name',
          },
          {
            path: 'segment',
            select: '_id name',
          },
        ],
      })
      .select('-createdBy -updatedBy -createdAt -updatedAt -__v');

    if (wishProduct.length > 0) {
      for (let product of wishProduct) {
        // console.log("--------------");
        // console.log(product);
        if (product.product.image && 'url' in product.product.image) {
          let url = product.product.image.url.map((item) => {
            return `${protocol}://${hostname}/${item}`;
          });
          product.product.image.url = url;
        }
      }

      return sendResponseWithData(res, 200, true, 'Product wishlist fetched successfully', wishProduct, true);
    }

    return sendResponseWithData(res, 200, true, 'No products in wishlist', wishProduct, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const removeProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    let checkExist = await Wishlist.findOne({ product: req.body.product, user: user._id });

    if (!checkExist) {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }

    let removeWishProduct = await Wishlist.deleteOne({ product: req.body.product, user: user._id });

    if (removeWishProduct.deletedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Product removed from wishlist');
    }

    return sendResponseWithoutData(res, 400, false, 'Product failed to remove from wishlist');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
