import { sendResponseOk, sendResponseBadReq, tryCatch, makeObjectId } from '../../helpers/helper.js';
import httpStatusCodes from '../../../utils/statusCodes.js';
import { pipelineProduct_s } from '../../service/ProductService.js';
import { isValidObjectId } from 'mongoose';
import { detailCategory_s } from '../../service/CategoryService.js';

export const productList = tryCatch(async (req, res) => {
  const page = Number(req.query?.page || 1);
  const count = Number(req.query?.count || 10);
  const pagination = req.query?.all === 'true' ? false : true;
  const search = req.query?.search || '';

  const serverPrefix = `${req.protocol}://${req.headers.host}/`;

  let pipeline = [
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'categories',
        foreignField: '_id',
        localField: 'category',
        as: 'category',
        pipeline: [
          { $match: { isDeleted: false } },
          {
            $lookup: {
              from: 'files',
              localField: 'image',
              foreignField: '_id',
              as: 'image',
              pipeline: [{ $project: { url: { $concat: [serverPrefix, 'image/', '$filename'] }, _id: 0 } }],
            },
          },
          {
            $unwind: { path: '$image', preserveNullAndEmptyArrays: true },
          },
          { $project: { isActive: 0, isDeleted: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 } },
        ],
      },
    },
    {
      $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: 'files',
        localField: 'image',
        foreignField: '_id',
        as: 'image',
        pipeline: [{ $project: { url: { $concat: [serverPrefix, 'image/', '$filename'] }, _id: 0 } }],
      },
    },
    {
      $match: {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { hindiTitle: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { hindiDescription: { $regex: search, $options: 'i' } },
        ],
      },
    },
    {
      $project: {
        hindiDescription: 0,
        description: 0,
        isActive: 0,
        isDeleted: 0,
        createdBy: 0,
        updatedBy: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
  ];

  const docCount = await pipelineProduct_s([...pipeline, ...[{ $count: 'totalCount' }]]);

  if (pagination) {
    pipeline.push({ $skip: (page - 1) * count }, { $limit: count });
  }

  let productList = await pipelineProduct_s(pipeline);

  return res.status(httpStatusCodes.OK).json({
    status: true,
    msg: 'Product list fetched successfully!',
    data: productList,
    totalCount: docCount.length > 0 ? docCount[0].totalCount : 0,
  });
});

export const productDetails = tryCatch(async (req, res) => {
  const serverPrefix = `${req.protocol}://${req.headers.host}/`;

  let pipeline = [
    { $match: { slug: req.params.slug, isDeleted: false, isActive: true } },
    {
      $lookup: {
        from: 'categories',
        foreignField: '_id',
        localField: 'category',
        as: 'category',
        pipeline: [
          { $match: { isDeleted: false } },
          {
            $lookup: {
              from: 'files',
              localField: 'image',
              foreignField: '_id',
              as: 'image',
              pipeline: [{ $project: { url: { $concat: [serverPrefix, 'image/', '$filename'] }, _id: 0 } }],
            },
          },
          {
            $unwind: { path: '$image', preserveNullAndEmptyArrays: true },
          },
          { $project: { isActive: 0, isDeleted: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 } },
        ],
      },
    },
    {
      $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: 'files',
        localField: 'image',
        foreignField: '_id',
        as: 'image',
        pipeline: [{ $project: { url: { $concat: [serverPrefix, 'image/', '$filename'] }, _id: 0 } }],
      },
    },
    {
      $project: {
        isActive: 0,
        isDeleted: 0,
        createdBy: 0,
        updatedBy: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
  ];

  let productInfo = await pipelineProduct_s(pipeline);

  if (productInfo) return sendResponseOk(res, 'Product details fetched successfully!', productInfo);
  return sendResponseBadReq(res, 'Invalid product!');
});

export const productListByCategory = tryCatch(async (req, res) => {
  
  const page = Number(req.query?.page || 1);
  const count = Number(req.query?.count || 10);
  const pagination = req.query?.all === 'true' ? false : true;
  const search = req.query?.search || '';
  const serverPrefix = `${req.protocol}://${req.headers.host}/`;

  const { categoryId } = req.params;

  if (!isValidObjectId(categoryId) || !(await detailCategory_s({ _id: categoryId }))) return sendResponseBadReq(res, "Invalid categoryId provided");

  let pipeline = [
    { $match: { isDeleted: false, category: makeObjectId(categoryId) } },
    {
      $lookup: {
        from: 'categories',
        foreignField: '_id',
        localField: 'category',
        as: 'category',
        pipeline: [
          { $match: { isDeleted: false } },
          {
            $lookup: {
              from: 'files',
              localField: 'image',
              foreignField: '_id',
              as: 'image',
              pipeline: [{ $project: { url: { $concat: [serverPrefix, 'image/', '$filename'] }, _id: 0 } }],
            },
          },
          {
            $unwind: { path: '$image', preserveNullAndEmptyArrays: true },
          },
          { $project: { isActive: 0, isDeleted: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 } },
        ],
      },
    },
    {
      $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: 'files',
        localField: 'image',
        foreignField: '_id',
        as: 'image',
        pipeline: [{ $project: { url: { $concat: [serverPrefix, 'image/', '$filename'] }, _id: 0 } }],
      },
    },
    {
      $match: {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { hindiTitle: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { hindiDescription: { $regex: search, $options: 'i' } },
        ],
      },
    },
    {
      $project: {
        hindiDescription: 0,
        description: 0,
        isActive: 0,
        isDeleted: 0,
        createdBy: 0,
        updatedBy: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
  ];

  const docCount = await pipelineProduct_s([...pipeline, ...[{ $count: 'totalCount' }]]);

  if (pagination) {
    pipeline.push({ $skip: (page - 1) * count }, { $limit: count });
  }

  let productList = await pipelineProduct_s(pipeline);

  return res.status(httpStatusCodes.OK).json({
    status: true,
    msg: 'Product list fetched successfully!',
    data: productList,
    totalCount: docCount.length > 0 ? docCount[0].totalCount : 0,
  });
});