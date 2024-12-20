import { sendResponseOk, sendResponseBadReq, tryCatch } from '../../helpers/helper.js';
import httpStatusCodes from '../../../utils/statusCodes.js';
import { pipelineProduct_s } from '../../service/ProductService.js';
import { detailCart_s } from '../../service/CartService.js';

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
  let user = req.apiUser;
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

  if (productInfo.length > 0) {
    productInfo[0].inCart = false;
    if (await detailCart_s({ user: user?._id, product: productInfo[0]?._id })) {
      productInfo[0].inCart = true;
    }
  }

  if (productInfo.length > 0) return sendResponseOk(res, 'Product details fetched successfully!', productInfo[0]);
  return sendResponseBadReq(res, 'Invalid product!');
});

export const productListByCategory = tryCatch(async (req, res) => {
  let user = req?.apiUser;
  const page = Number(req.query?.page || 1);
  const count = Number(req.query?.count || 10);
  const pagination = req.query?.all === 'true' ? false : true;
  const search = req.query?.search || '';
  const serverPrefix = `${req.protocol}://${req.headers.host}/`;

  const { categorySlug } = req.params;

  // if (!(await detailCategory_s({ slug: categorySlug }))) return sendResponseBadReq(res, 'Invalid categoryId provided');

  let pipeline = [
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'categories',
        foreignField: '_id',
        localField: 'category',
        as: 'category',
        pipeline: [
          { $match: { isDeleted: false, slug: categorySlug } },
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
      $unwind: { path: '$category', preserveNullAndEmptyArrays: false },
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

  productList = await Promise.all(
    productList.map(async (item) => {
      let inCart = false;
      if (await detailCart_s({ user: user?._id, product: item.product?._id })) {
        inCart = true;
      }
      item.inCart = inCart;
      return item;
    }),
  );

  return res.status(httpStatusCodes.OK).json({
    status: true,
    msg: 'Product list fetched successfully!',
    data: productList,
    totalCount: docCount.length > 0 ? docCount[0].totalCount : 0,
  });
});
