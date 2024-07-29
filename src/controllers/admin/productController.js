import { detailCategory_s } from "../../service/CategoryService.js";
import { sendResponseOk, sendResponseBadReq, tryCatch, sendResponseWithoutData, removeSpace } from "../../helpers/helper.js";
import { isValidObjectId } from "mongoose";
import httpStatusCodes from "../../../utils/statusCodes.js";
import { deleteProduct_s, detailProduct_s, insertProduct_s, pipelineProduct_s, updateProduct_s } from "../../service/ProductService.js";

export const createProduct = tryCatch(async (req, res) => {
    let { title, description, image, category, price, stock, active } = req.body;

    const categoryInfo = await detailCategory_s({ _id: category });
    if (!isValidObjectId(category) || !categoryInfo) return sendResponseBadReq(res, "Invalid category id!");

    if (await detailProduct_s({ title: title })) return sendResponseBadReq(res, "Product with this title already exists!");

    const slug = `${removeSpace(title, "-")}-${categoryInfo.title}-${Date.now()}`.toLowerCase();

    let newData = {
        title,
        description,
        slug,
        image,
        category,
        price,
        stock,
        active,
        createdBy: req.apiUser._id,
        updatedBy: req.apiUser._id
    }

    if ('strikePrice' in req.body) {
        if (req.body.strikePrice < price) return sendResponseBadReq(res, "strikePrice value should be greater than price");
        newData.strikePrice = req.body.strikePrice;
    }

    if ('hindiTitle' in req.body && req.body.hindiTitle) newData.hindiTitle = req.body.hindiTitle;

    if ('hindiDescription' in req.body && req.body.hindiDescription) newData.hindiDescription = req.body.hindiDescription;

    if ('slug' in req.body && req.body.slug) newData.slug = req.body.slug;
    if ('adminRating' in req.body && req.body.adminRating) newData.adminRating = req.body.adminRating;

    let insertStatus = await insertProduct_s(newData);
    if (!insertStatus) return sendResponseBadReq(res, 'Product insertion failed! try again in sometime or report the issue!')

    return sendResponseWithoutData(res, httpStatusCodes.CREATED, true, 'Product inserted successfully!');
});

export const getProductList = tryCatch(async (req, res) => {
    const page = Number(req.query?.page || 1);
    const count = Number(req.query?.count || 10);
    const pagination = req.query?.all === 'true' ? false : true;
    const search = req.query?.search || "";

    let pipeline = [
        { $match: { isDeleted: false } },
        {
            $lookup: {
                from: 'categories',
                foreignField: '_id',
                localField: 'category',
                as: 'category',
                pipeline: [{ $match: { isDeleted: false } }, { $project: { isDeleted: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 } }]
            }
        },
        {
            $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
        },
        {
            $match: {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { hindiTitle: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { hindiDescription: { $regex: search, $options: 'i' } },
                ]
            }
        },
        {
            $project: {
                hindiDescription: 0,
                description: 0,
                isDeleted: 0,
                createdBy: 0,
                updatedBy: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
            }
        }
    ];

    const docCount = await pipelineProduct_s([...pipeline, ...[{ $count: 'totalCount' }]]);

    if (pagination) {
        pipeline.push(
            { $skip: (page - 1) * count },
            { $limit: count }
        );
    }

    let productList = await pipelineProduct_s(pipeline)

    return res.status(httpStatusCodes.OK).json({
        status: true,
        msg: "Product list fetched successfully!",
        data: productList,
        totalCount: docCount.length > 0 ? docCount[0].totalCount : 0
    })
});

export const getProductDetails = tryCatch(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return sendResponseBadReq(res, "Invalid product id!");
    let productInfo = await detailProduct_s({ _id: req.params.id }, "-isDeleted -__v", [{ path: 'category', select: 'title slug isActive' }]);
    if (productInfo) return sendResponseOk(res, 'Product details fetched successfully!', productInfo);
    return sendResponseBadReq(res, 'Invalid product id!');
});

export const editProduct = tryCatch(async (req, res) => {
    let { title, description, image, category, price, stock, active } = req.body;

    if (!isValidObjectId(req.params.id)) return sendResponseBadReq(res, "Invalid product id!");

    const categoryInfo = await detailCategory_s({ _id: category });
    if (!isValidObjectId(category) || !categoryInfo) return sendResponseBadReq(res, "Invalid category id!");

    if (await detailProduct_s({ title: title, _id: { $ne: req.params.id } })) return sendResponseBadReq(res, "Product with this title already exists!");

    const slug = `${removeSpace(title, "-")}-${categoryInfo.title}-${Date.now()}`.toLowerCase();

    let newData = {
        title,
        description,
        image,
        category,
        price,
        stock,
        isActive: active,
        createdBy: req.apiUser._id,
        updatedBy: req.apiUser._id
    }

    if ('generateSlug' in req.body && req.body.generateSlug) newData.slug = slug;

    if ('slug' in req.body) newData.slug = req.body.slug;

    if ('strikePrice' in req.body) {
        if (req.body.strikePrice < price) return sendResponseBadReq(res, "strikePrice value should be greater than price");
        newData.strikePrice = req.body.strikePrice;
    }

    if ('hindiTitle' in req.body && req.body.hindiTitle) newData.hindiTitle = req.body.hindiTitle;

    if ('hindiDescription' in req.body && req.body.hindiDescription) newData.hindiDescription = req.body.hindiDescription;

    if ('adminRating' in req.body && req.body.adminRating) newData.adminRating = req.body.adminRating;


    let updateStatus = await updateProduct_s({ _id: req.params.id }, newData);
    if (!updateStatus) return sendResponseBadReq(res, 'Product updation failed! try again in sometime or report the issue!')

    return sendResponseWithoutData(res, httpStatusCodes.CREATED, true, 'Product updated successfully!');
});

export const deleteProduct = tryCatch(async (req, res) => {
    if (!isValidObjectId(req.params.id) || !await detailProduct_s({ _id: req.params.id })) return sendResponseBadReq(res, "Invalid product id!");
    await deleteProduct_s({ _id: req.params.id });
    return sendResponseOk(res, 'Product deleted successfully!');
});