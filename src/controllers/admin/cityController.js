import { insertCity_s, listCity_s, detailCity_s, updateCity_s, deleteCity_s } from '../../service/CityService.js';
import { sendResponseOk, sendResponseBadReq, tryCatch, sendResponseWithoutData } from '../../helpers/helper.js';
import { isValidObjectId } from 'mongoose';
import httpStatusCodes from '../../../utils/statusCodes.js';

export const createCity = tryCatch(async (req, res) => {
  const { name, state } = req.body;
  const newCity = { name, state };

  const existingCity = await detailCity_s({ name });
  if (existingCity) return sendResponseBadReq(res, 'City name already exists!');

  const insertStatus = await insertCity_s(newCity);
  if (!insertStatus) return sendResponseBadReq(res, 'City insertion failed! Try again or report the issue!');

  return sendResponseWithoutData(res, httpStatusCodes.CREATED, true, 'City inserted successfully!');
});

export const getCityList = tryCatch(async (req, res) => {
  const { search } = req.query;

  const cityList = await listCity_s(
    {
      $or: [{ name: { $regex: search || '', $options: 'i' } }],
    },
    '',
    [{ path: 'state', select: 'name', match: { isDeleted: false } }],
    true,
    1,
    10,
  );

  if (cityList.length > 0) return sendResponseOk(res, 'City list fetched successfully!', cityList);
  return sendResponseOk(res, 'No city available!', []);
});

export const getCityListByState = tryCatch(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendResponseOk(res, 'No city available!', []);
  }

  const cityList = await listCity_s(
    {
      state: id,
    },
    '',
    [{ path: 'state', select: 'name', match: { isDeleted: false } }],
    true,
    1,
    10,
  );

  if (cityList.length > 0) return sendResponseOk(res, 'City list fetched successfully!', cityList);
  return sendResponseOk(res, 'No city available!', []);
});

export const getCityDetails = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id)) return sendResponseBadReq(res, 'Invalid city id!');

  const city = await detailCity_s({ _id: req.params.id }, '', [
    { path: 'state', select: 'name', match: { isDeleted: false } },
  ]);
  if (city) return sendResponseOk(res, 'City details fetched successfully!', city);
  return sendResponseBadReq(res, 'Invalid city id!');
});

export const editCity = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id) || !(await detailCity_s({ _id: req.params.id }))) {
    return sendResponseBadReq(res, 'Invalid city id!');
  }

  const updatedData = {
    name: req.body.name,
    state: req.body.state,
    updatedAt: Date.now(),
  };

  const updateStatus = await updateCity_s({ _id: req.params.id }, updatedData);
  if (updateStatus) return sendResponseOk(res, 'City updated successfully!');
  return sendResponseBadReq(res, 'Failed to update city!');
});

export const deleteCity = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id) || !(await detailCity_s({ _id: req.params.id }))) {
    return sendResponseBadReq(res, 'Invalid city id!');
  }

  await deleteCity_s({ _id: req.params.id });
  return sendResponseOk(res, 'City deleted successfully!');
});
