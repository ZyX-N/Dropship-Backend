import {
  insertPincode_s,
  listPincode_s,
  detailPincode_s,
  updatePincode_s,
  deletePincode_s,
} from '../../service/PincodeService.js';
import { sendResponseOk, sendResponseBadReq, tryCatch, sendResponseWithoutData } from '../../helpers/helper.js';
import { isValidObjectId } from 'mongoose';
import httpStatusCodes from '../../../utils/statusCodes.js';

export const createPincode = tryCatch(async (req, res) => {
  const { code, city, state } = req.body;
  const newPincode = { code, city, state };

  const existingPincode = await detailPincode_s({ code });
  if (existingPincode) return sendResponseBadReq(res, 'Pincode already exists!');

  const insertStatus = await insertPincode_s(newPincode);
  if (!insertStatus) return sendResponseBadReq(res, 'Pincode insertion failed! Try again or report the issue!');

  return sendResponseWithoutData(res, httpStatusCodes.CREATED, true, 'Pincode inserted successfully!');
});

export const getPincodeList = tryCatch(async (req, res) => {
  const { search } = req.query;

  const pincodeList = await listPincode_s(
    {
      $or: [{ code: { $regex: search || '', $options: 'i' } }],
    },
    '',
    [
      { path: 'state', select: 'name', match: { isDeleted: false } },
      { path: 'city', select: 'name', match: { isDeleted: false } },
    ],
    true,
    1,
    10,
  );

  if (pincodeList.length > 0) return sendResponseOk(res, 'Pincode list fetched successfully!', pincodeList);
  return sendResponseOk(res, 'No pincode available!', []);
});

export const getPincodeDetails = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendResponseBadReq(res, 'Invalid pincode id!');

  const pincode = await detailPincode_s({ _id: req.params.id }, '', [
    { path: 'state', select: 'name', match: { isDeleted: false } },
    { path: 'city', select: 'name', match: { isDeleted: false } },
  ]);
  if (pincode) return sendResponseOk(res, 'Pincode details fetched successfully!', pincode);
  return sendResponseBadReq(res, 'Invalid pincode id!');
});

export const editPincode = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id) || !(await detailPincode_s({ _id: req.params.id }))) {
    return sendResponseBadReq(res, 'Invalid pincode id!');
  }

  const updatedData = {
    code: req.body.code,
    city: req.body.city,
    state: req.body.state,
    updatedAt: Date.now(),
  };

  const updateStatus = await updatePincode_s({ _id: req.params.id }, updatedData);
  if (updateStatus) return sendResponseOk(res, 'Pincode updated successfully!');
  return sendResponseBadReq(res, 'Failed to update pincode!');
});

export const deletePincode = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id) || !(await detailPincode_s({ _id: req.params.id }))) {
    return sendResponseBadReq(res, 'Invalid pincode id!');
  }

  await deletePincode_s({ _id: req.params.id });
  return sendResponseOk(res, 'Pincode deleted successfully!');
});
