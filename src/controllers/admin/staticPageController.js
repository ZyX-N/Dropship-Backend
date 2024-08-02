import {
  sendResponseOk,
  sendResponseBadReq,
  tryCatch,
  sendResponseWithoutData,
  makeObjectId,
  removeSpace,
  sendResponseCreated,
} from '../../helpers/helper.js';
import { isValidObjectId } from 'mongoose';
import httpStatusCodes from '../../../utils/statusCodes.js';
import {
  deleteStaticPage_s,
  detailStaticPage_s,
  insertStaticPage_s,
  pipelineStaticPage_s,
  updateStaticPage_s,
} from '../../service/StaticPageService.js';

export const createStaticPage = tryCatch(async (req, res) => {
  let { title, template } = req.body;
  let newData = {
    title,
    template,
    createdBy: req.apiUser._id,
    updatedBy: req.apiUser._id,
  };

  if (req.body?.slug) {
    newData.slug = req.body.slug;
  } else {
    newData.slug = removeSpace(req.body.title);
  }

  if (req.body?.logo && isValidObjectId(req.body?.logo)) {
    newData.logo = req.body.logo;
  }

  if (await detailStaticPage_s({ slug: newData.slug })) return sendResponseBadReq(res, 'Slug already exists!');

  let insertStatus = await insertStaticPage_s(newData);
  if (!insertStatus)
    return sendResponseBadReq(res, 'Static Page insertion failed! try again in sometime or report the issue!');

  return sendResponseWithoutData(res, httpStatusCodes.CREATED, true, 'Static Page inserted successfully!');
});

export const getStaticPageList = tryCatch(async (req, res) => {
  const serverPrefix = `${req.protocol}://${req.headers.host}/`;
  let pipeline = [
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'files',
        localField: 'logo',
        foreignField: '_id',
        as: 'logo',
        pipeline: [{ $project: { url: { $concat: [serverPrefix, 'image/', '$filename'] }, path: 1, filename: 1 } }],
      },
    },
    {
      $unwind: { path: '$logo', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        template: 0,
        isDeleted: 0,
        __v: 0,
      },
    },
  ];

  let staticPageList = await pipelineStaticPage_s(pipeline);
  if (staticPageList.length > 0) return sendResponseOk(res, 'Static Page list fetched successfully!', staticPageList);
  return sendResponseOk(res, 'No Static Page available!', []);
});

export const getStaticPageDetails = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendResponseBadReq(res, 'Invalid category id!');

  const serverPrefix = `${req.protocol}://${req.headers.host}/`;
  let pipeline = [
    { $match: { _id: makeObjectId(req.params.id), isDeleted: false } },
    {
      $lookup: {
        from: 'files',
        localField: 'logo',
        foreignField: '_id',
        as: 'logo',
        pipeline: [{ $project: { url: { $concat: [serverPrefix, 'image/', '$filename'] }, path: 1, filename: 1 } }],
      },
    },
    {
      $unwind: { path: '$logo', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        isDeleted: 0,
        __v: 0,
      },
    },
  ];

  let staticPageInfo = await pipelineStaticPage_s(pipeline);

  if (staticPageInfo.length > 0)
    return sendResponseOk(res, 'Static Page details fetched successfully!', staticPageInfo[0]);
  return sendResponseBadReq(res, 'Invalid Static Page id!');
});

export const editStaticPage = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id) || !(await detailStaticPage_s({ _id: req.params.id })))
    return sendResponseBadReq(res, 'Invalid static page id!');

  let updatedData = {
    title: req.body.title,
    isActive: req.body.active,
    updatedBy: req.apiUser._id,
    updatedAt: Date.now(),
  };

  if ('slug' in req.body && req.body.slug) updatedData.slug = req.body.slug;
  if ('template' in req.body && req.body.template) updatedData.template = req.body.template;

  if (req.body?.logo && isValidObjectId(req.body?.logo)) updatedData.logo = req.body.logo;

  let updateStatus = await updateStaticPage_s({ _id: req.params.id }, updatedData);
  if (updateStatus) return sendResponseCreated(res, 'Static page updated successfully!');
  return sendResponseBadReq(res, 'Invalid category id!');
});

export const deleteStaticPage = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id) || !(await detailStaticPage_s({ _id: req.params.id })))
    return sendResponseBadReq(res, 'Invalid static page id!');
  await deleteStaticPage_s({ _id: req.params.id });
  return sendResponseOk(res, 'Static page deleted successfully!');
});
