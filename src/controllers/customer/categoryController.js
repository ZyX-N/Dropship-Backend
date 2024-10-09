import { aggregateCategory_s, detailCategory_s } from '../../service/CategoryService.js';
import { sendResponseOk, tryCatch } from '../../helpers/helper.js';

export const categoryList = tryCatch(async (req, res) => {
  const serverPrefix = `${req.protocol}://${req.headers.host}/`;
  let pipeline = [
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
    {
      $project: {
        isDeleted: 0,
        isActive: 0,
        createdBy: 0,
        updatedBy: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      },
    },
  ];

  let categoryList = await aggregateCategory_s(pipeline);
  return sendResponseOk(res, 'Category list fetched successfully!', categoryList);
});

export const categoryDetails = tryCatch(async (req, res) => {
  const serverPrefix = `${req.protocol}://${req.headers.host}/`;
  let category = await detailCategory_s({ slug: req.params.slug, isActive: true }, 'title slug image', [
    { path: 'image' },
  ]);

  if (category && category.image) {
    category.image = `${serverPrefix}image/${category.image.filename}`;
  }

  return sendResponseOk(res, 'Category details fetched successfully!', category);
});
