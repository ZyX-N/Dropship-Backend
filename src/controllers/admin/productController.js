import { errorLog } from '../../../config/logger.js';
import {
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  makeObjectId,
} from '../../helpers/helper.js';
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import { isValidObjectId } from 'mongoose';
import SubCategory from '../../models/SubCategory.js';

export const createProduct = async (req, res) => {
  try {
    let user = req.apiUser;
    const CategoryInfo = await Category.findById(req.body.category);

    if ('subCategory' in req.body && req.body.subCategory) {
      const subCategoryInfo = await SubCategory.findOne({
        _id: req.body.subCategory,
        category: req.body.category,
        isDeleted: false,
      });
      if (!subCategoryInfo) {
        return sendResponseWithoutData(
          res,
          400,
          false,
          'Invalid sub category, please provide the correct sub category which lies under the given category!',
        );
      }
    }

    const dataSave = await Product.create({
      name: req.body.name,
      description: req.body.description || '',
      subCategory: req.body.subCategory || null,
      category: req.body.category,
      segment: CategoryInfo.segment,
      image: req.body.file || null,
      videoUrl: req.body.videoUrl || null,
      mrp: req.body.mrp,
      vendorPrice: req.body.vendorPrice,
      deliveryType: req.body.deliveryType,
      price: req.body.price,
      createdBy: user._id,
      updatedBy: user._id,
    });

    if (dataSave) {
      return sendResponseWithoutData(res, 200, true, 'Product has been added successfully!');
    } else {
      return sendResponseWithoutData(res, 400, false, 'Product fail to add, try again in sometime!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const listProduct = async (req, res) => {
  try {
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let filter = { isDeleted: false };

    if (req.body.category) {
      filter.category = makeObjectId(req.body.category);
    }

    let data = await Product.find(filter)
      .populate([
        { path: 'subCategory', select: '-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v' },
        { path: 'category', select: '-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v' },
        { path: 'segment', select: '-isDeleted -createdAt -updatedAt -__v' },
        { path: 'image', select: '-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v' },
      ])
      .select('-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v')
      .lean();

    for (let product of data) {
      if (product.image && 'url' in product.image && product.image.url.length > 0) {
        let productUrl = product.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
        product.image = productUrl;
      }
    }

    if (data.length > 0) {
      return sendResponseWithData(res, 200, true, 'Product list get Successfully', data, true);
    }

    return sendResponseWithData(res, 200, true, 'No product found', data, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const productDetails = async (req, res) => {
  try {
    let productId = req?.params?.id;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    if (productId && isValidObjectId(productId)) {
      let productInfo = await Product.find({ _id: makeObjectId(productId), isDeleted: false })
        .populate([
          { path: 'subCategory', select: '-isDeleted -createdAt -updatedAt -__v' },
          { path: 'category', select: '-isDeleted -createdAt -updatedAt -__v' },
          { path: 'segment', select: '-isDeleted -createdAt -updatedAt -__v' },
          { path: 'image', select: '-isDeleted -createdAt -updatedAt -createdBy -updatedBy -__v' },
        ])
        .select('-isDeleted -createdAt -updatedAt -__v')
        .lean();

      if (productInfo.length === 0) {
        return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
      }

      productInfo = productInfo[0];

      if (productInfo.image && 'url' in productInfo.image && productInfo.image.url.length > 0) {
        productInfo.image.url = productInfo.image.url.map((item) => {
          return `${protocol}://${hostname}/${item}`;
        });
      }

      return sendResponseWithData(res, 200, true, 'Product details fetched successfully!', productInfo);
    } else {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const updateProduct = async (req, res) => {
  try {
    let user = req.apiUser;

    const CategoryInfo = await Category.findById(req.body.category);

    if ('subCategory' in req.body && req.body.subCategory) {
      const subCategoryInfo = await SubCategory.findOne({
        _id: req.body.subCategory,
        category: req.body.category,
        isDeleted: false,
      });
      if (!subCategoryInfo) {
        return sendResponseWithoutData(
          res,
          400,
          false,
          'Invalid sub category, please provide the correct sub category which lies under the given category!',
        );
      }
    }

    let updateObj = {
      name: req.body.name,
      subCategory: req.body.subCategory || null,
      category: req.body.category,
      segment: CategoryInfo.segment,
      mrp: req.body.mrp,
      price: req.body.price,
      vendorPrice: req.body.vendorPrice,
      deliveryType: req.body.deliveryType,
      isActive: req.body.isActive,
      updatedBy: user._id,
      updatedAt: Date.now(),
    };

    if ('videoUrl' in req.body) {
      updateObj.videoUrl = req.body.videoUrl || null;
    }
    if ('file' in req.body) {
      updateObj.image = req.body.file || null;
    }
    if ('description' in req.body) {
      updateObj.description = req.body.description || '';
    }

    let dataSave = await Product.updateOne({ _id: req.body.id }, { $set: updateObj });

    if (dataSave.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Product has been updated successfully!');
    }
    return sendResponseWithoutData(res, 400, false, 'Product fail to update, try again in sometime!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    let productId = req?.params?.id;

    if (productId && isValidObjectId(productId)) {
      const productInfo = await Product.findOne({ _id: productId, isDeleted: false });

      if (!productInfo) {
        return sendResponseWithoutData(res, 400, false, 'Invalid category Id!');
      }

      let dataSave = await Product.updateOne(
        { _id: productId },
        {
          $set: {
            isDeleted: true,
          },
        },
      );

      if (dataSave.modifiedCount > 0) {
        return sendResponseWithoutData(res, 200, true, 'Product has been deleted Successfully!');
      } else {
        return sendResponseWithoutData(res, 400, false, 'Something Went Wrong!');
      }
    }
    return sendResponseWithoutData(res, 400, false, 'Invalid product Id!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
