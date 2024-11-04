import { sendResponseBadReq, sendResponseCreated, sendResponseOk, tryCatch } from '../../helpers/helper.js';
import { detailState_s, listState_s } from '../../service/StateService.js';
import { detailCity_s, listCity_s } from '../../service/CityService.js';
import { detailPincode_s, listPincode_s } from '../../service/PincodeService.js';
import { isValidObjectId } from 'mongoose';
import { insertAddress_s, listAddress_s, detailAddress_s, updateAddress_s } from '../../service/AddressService.js';

export const stateList = tryCatch(async (req, res) => {
  return sendResponseOk(res, 'State fetched successfully!', await listState_s());
});

export const cityByStateList = tryCatch(async (req, res) => {
  let { stateId } = req.params;
  if (!stateId || !isValidObjectId(stateId)) return sendResponseOk(res, 'No city found!', []);
  return sendResponseOk(res, 'City fetched successfully!', await listCity_s({ state: stateId }));
});

export const pincodeByCityList = tryCatch(async (req, res) => {
  let { cityId } = req.params;
  if (!cityId || !isValidObjectId(cityId)) return sendResponseOk(res, 'No pincode found!', []);
  return sendResponseOk(res, 'Pincode fetched successfully!', await listPincode_s({ city: cityId }));
});

export const pincodeSearch = tryCatch(async (req, res) => {
  let { pincode } = req.body;
  if (!pincode) pincode = '';
  return sendResponseOk(
    res,
    'Pincode fetched successfully!',
    await listPincode_s({ $or: [{ code: { $regex: pincode || '', $options: 'i' } }] }, 'code state city', [
      { path: 'state', select: 'name' },
      { path: 'city', select: 'name' },
    ]),
  );
});

export const createAddress = tryCatch(async (req, res) => {
  let { state, city, pincode, area, street } = req.body;

  if (!state || !isValidObjectId(state) || !(await detailState_s({ _id: state })))
    return sendResponseBadReq(res, 'Invalid state!');
  if (!city || !isValidObjectId(city) || !(await detailCity_s({ _id: city, state })))
    return sendResponseBadReq(res, 'Invalid city!');
  if (!pincode || !isValidObjectId(pincode) || !(await detailPincode_s({ _id: pincode, city, state })))
    return sendResponseBadReq(res, 'Invalid pincode!');

  await insertAddress_s({ user: req.apiUser._id, state, city, pincode, area: area || '', street: street || '' });

  return sendResponseCreated(res, 'Address added successfully!');
});

export const listAddress = tryCatch(async (req, res) => {
  return sendResponseOk(
    res,
    'Address list fetched successfully!',
    await listAddress_s({ user: req.apiUser._id }, '', [
      { path: 'state', select: 'name', match: { isDeleted: false } },
      { path: 'city', select: 'name', match: { isDeleted: false } },
      { path: 'pincode', select: 'code', match: { isDeleted: false } },
    ]),
  );
});

export const detailsAddress = tryCatch(async (req, res) => {
  if (!req.params.id || !isValidObjectId(req.params.id)) return sendResponseBadReq(res, 'Invalid address!');
  return sendResponseOk(
    res,
    'Address details fetched successfully!',
    await detailAddress_s({ user: req.apiUser._id }, '', [
      { path: 'state', select: 'name', match: { isDeleted: false } },
      { path: 'city', select: 'name', match: { isDeleted: false } },
      { path: 'pincode', select: 'code', match: { isDeleted: false } },
    ]),
  );
});

export const deleteAddress = tryCatch(async (req, res) => {
  if (!req.params.id || !isValidObjectId(req.params.id)) return sendResponseBadReq(res, 'Invalid address!');
  await updateAddress_s({ _id: req.params.id, user: req.apiUser._id }, { isDeleted: true });
  return sendResponseOk(res, 'Address deleted successfully!');
});

export const updateAddress = tryCatch(async (req, res) => {
  let { state, city, pincode, area, street } = req.body;

  if (!req.params.id || !isValidObjectId(req.params.id)) return sendResponseBadReq(res, 'Invalid id!');
  if (!state || !isValidObjectId(state) || !(await detailState_s({ _id: state })))
    return sendResponseBadReq(res, 'Invalid state!');
  if (!city || !isValidObjectId(city) || !(await detailCity_s({ _id: city, state })))
    return sendResponseBadReq(res, 'Invalid city!');
  if (!pincode || !isValidObjectId(pincode) || !(await detailPincode_s({ _id: pincode, city, state })))
    return sendResponseBadReq(res, 'Invalid pincode!');

  let newData = {
    state,
    city,
    pincode,
    updatedAt: Date.now(),
  };

  if (area) newData.area = area;
  if (street) newData.street = street;

  await updateAddress_s({ _id: req.params.id, user: req.apiUser._id }, newData);
  return sendResponseCreated(res, 'Address updated successfully!');
});
