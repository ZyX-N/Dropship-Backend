import { sendResponseOk, sendResponseBadReq, tryCatch, sendResponseCreated } from '../../helpers/helper.js';
import { isValidObjectId } from 'mongoose';
import {
  insertSetting_s,
  updateSetting_s,
  detailSetting_s,
  aggregateSetting_s,
} from '../../service/SettingsService.js';

export const insertSettings = tryCatch(async (req, res) => {
  let { name, logo, address, instagram, facebook, twitter, youtube, email, mobile } = req.body;
  let newData = {
    name,
    email,
    mobile,
    logo,
    address,
    instagram,
    facebook,
    twitter,
    youtube,
  };

  if (!isValidObjectId(logo)) return sendResponseBadReq(res, 'Invalid logo provided!');

  let checkData = await detailSetting_s({});
  console.log(checkData);

  if (!(await detailSetting_s({}))) {
    await insertSetting_s(newData);
    return sendResponseCreated(res, 'Settings created successfully!');
  }

  await updateSetting_s({}, newData);

  return sendResponseCreated(res, 'Settings updated successfully!');
});

export const getSettings = tryCatch(async (req, res) => {
  const serverPrefix = `${req.protocol}://${req.headers.host}/`;
  let pipeline = [
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
        _id: 0,
        isDeleted: 0,
        __v: 0,
      },
    },
  ];

  let settingsDetail = await aggregateSetting_s(pipeline);

  if (settingsDetail.length > 0) return sendResponseOk(res, 'Setting fetched successfully!', settingsDetail[0]);
  return sendResponseOk(res, 'Setting not available!');
});
