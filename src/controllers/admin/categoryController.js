import { aggregateCategory_s, deleteCategory_s, detailCategory_s, insertCategory_s, listCategory_s, updateCategory_s } from "../../service/CategoryService.js";
import { sendResponseOk, sendResponseBadReq, tryCatch, sendResponseWithoutData, makeObjectId } from "../../helpers/helper.js";
import { isValidObjectId } from "mongoose";
import httpStatusCodes from "../../../utils/statusCodes.js";

export const createCategory = tryCatch(async (req, res) => {
    let { title } = req.body;
    let newData = {
        title,
        createdBy: req.apiUser._id,
        updatedBy: req.apiUser._id
    }

    if (req.body?.slug) {
        newData.slug = req.body.slug;
    } else {
        newData.slug = req.body.title.replaceAll(" ", "-");
    }

    if (req.body?.image && isValidObjectId(req.body?.image)) {
        newData.image = req.body.image;
    }

    if (await detailCategory_s({ slug: newData.slug })) return sendResponseBadReq(res, "Slug already exists!")

    let insertStatus = await insertCategory_s(newData);
    if (!insertStatus) return sendResponseBadReq(res, 'Category insertion failed! try again in sometime or report the issue!')

    return sendResponseWithoutData(res, httpStatusCodes.CREATED, true, 'Category inserted successfully!');
});

export const getCategoryList = tryCatch(async (req, res) => {
    const serverPrefix = `${req.protocol}://${req.headers.host}/`
    let pipeline = [
        { $match: { isDeleted: false } },
        {
            $lookup: {
                from: 'files',
                localField: 'image',
                foreignField: '_id',
                as: 'image',
                pipeline: [
                    { $project: { url: { $concat: [serverPrefix, "image/", "$filename"] }, path: 1, filename: 1 } }
                ]
            }
        },
        {
            $unwind: { path: '$image', preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                isDeleted: 0,
                __v: 0
            }
        }
    ];

    let categoryList = await aggregateCategory_s(pipeline);
    if (categoryList.length > 0) return sendResponseOk(res, 'Category list fetched successfully!', categoryList);
    return sendResponseOk(res, 'No category available!', []);
});

export const getCategoryDetails = tryCatch(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return sendResponseBadReq(res, "Invalid category id!");

    const serverPrefix = `${req.protocol}://${req.headers.host}/`
    let pipeline = [
        { $match: { _id: makeObjectId(req.params.id), isDeleted: false } },
        {
            $lookup: {
                from: 'files',
                localField: 'image',
                foreignField: '_id',
                as: 'image',
                pipeline: [
                    { $project: { url: { $concat: [serverPrefix, "image/", "$filename"] }, path: 1, filename: 1 } }
                ]
            }
        },
        {
            $unwind: { path: '$image', preserveNullAndEmptyArrays: true }
        },
        {
            $project: {
                isDeleted: 0,
                __v: 0
            }
        },
    ];

    let categoryInfo = await aggregateCategory_s(pipeline);

    if (categoryInfo.length > 0) return sendResponseOk(res, 'Category details fetched successfully!', categoryInfo[0]);
    return sendResponseBadReq(res, 'Invalid category id!');
});

export const editCategory = tryCatch(async (req, res) => {
    if (!isValidObjectId(req.params.id) || !await detailCategory_s({ _id: req.params.id })) return sendResponseBadReq(res, "Invalid category id!");
    // console.log(req.apiUser);
    let updatedData = {
        title: req.body.title,
        isActive: req.body.active,
        updatedBy: req.apiUser._id,
        updatedAt: Date.now()
    }

    if ('slug' in req.body && req.body.slug) updatedData.slug = req.body.slug;

    if (req.body?.image && isValidObjectId(req.body?.image)) updatedData.image = req.body.image;

    let updateStatus = await updateCategory_s({ _id: req.params.id }, updatedData);
    if (updateStatus) return sendResponseOk(res, 'Category updated successfully!');
    return sendResponseBadReq(res, 'Invalid category id!');
});

export const deleteCategory = tryCatch(async (req, res) => {
    if (!isValidObjectId(req.params.id) || !await detailCategory_s({ _id: req.params.id })) return sendResponseBadReq(res, "Invalid category id!");
    await deleteCategory_s({ _id: req.params.id });
    return sendResponseOk(res, 'Category deleted successfully!');
});

export const getCategoryListDropDown = tryCatch(async (req, res) => {
    let categoryList = await listCategory_s({}, "title");
    if (categoryList.length > 0) return sendResponseOk(res, 'Category list fetched successfully!', categoryList);
    return sendResponseOk(res, 'No category available!', []);
});