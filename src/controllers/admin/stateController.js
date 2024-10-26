import { deleteState_s, detailState_s, insertState_s, listState_s, updateState_s } from "../../service/StateService.js";
import { sendResponseOk, sendResponseBadReq, tryCatch, sendResponseWithoutData } from "../../helpers/helper.js";
import { isValidObjectId } from "mongoose";
import httpStatusCodes from "../../../utils/statusCodes.js";

export const createState = tryCatch(async (req, res) => {
    let { name } = req.body;
    let newData = {
        title
    }

    if (await detailState_s({ name })) return sendResponseBadReq(res, "Name already exists!")

    let insertStatus = await insertState_s(newData);
    if (!insertStatus) return sendResponseBadReq(res, 'State insertion failed! try again in sometime or report the issue!')

    return sendResponseWithoutData(res, httpStatusCodes.CREATED, true, 'State inserted successfully!');
});

export const getStateList = tryCatch(async (req, res) => {
    const { search } = req.query;
    let stateList = await listState_s({
        $or: [
            { name: { $regex: search || "", $options: 'i' } }
        ]
    }, "", [], true, 1, 10);
    if (stateList.length > 0) return sendResponseOk(res, 'State list fetched successfully!', stateList);
    return sendResponseOk(res, 'No state available!', []);
});

export const getStateDetails = tryCatch(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return sendResponseBadReq(res, "Invalid state id!");

    let state = await detailState_s({ _id: req.params.id });

    if (state) return sendResponseOk(res, 'State details fetched successfully!', state);
    return sendResponseBadReq(res, 'Invalid state id!');
});

export const editState = tryCatch(async (req, res) => {
    if (!isValidObjectId(req.params.id) || !await detailState_s({ _id: req.params.id })) return sendResponseBadReq(res, "Invalid state id!");

    let updatedData = {
        name: req.body.name,
        updatedAt: Date.now()
    }

    let updateStatus = await updateState_s({ _id: req.params.id }, updatedData);
    if (updateStatus) return sendResponseOk(res, 'State updated successfully!');
    return sendResponseBadReq(res, 'Invalid category id!');
});

export const deleteState = tryCatch(async (req, res) => {
    if (!isValidObjectId(req.params.id) || !await detailState_s({ _id: req.params.id })) return sendResponseBadReq(res, "Invalid category id!");
    await deleteState_s({ _id: req.params.id });
    return sendResponseOk(res, 'State deleted successfully!');
});