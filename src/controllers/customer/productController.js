import { sendResponseOk, sendResponseBadReq, tryCatch } from "../../helpers/helper.js";
import httpStatusCodes from "../../../utils/statusCodes.js";
import { detailProduct_s, pipelineProduct_s } from "../../service/ProductService.js";

export const productList = tryCatch(async (req, res) => {
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
                pipeline: [{ $match: { isDeleted: false } }, { $project: { isActive: 0, isDeleted: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 } }]
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
                isActive: 0,
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

export const productDetails = tryCatch(async (req, res) => {
    const populate = [
        { path: 'category', select: 'title' }
    ];

    let productInfo = await detailProduct_s({ slug: req.params.slug, isActive: true }, "-isDeleted -__v -isActive -createdBy -updatedBy -createdAt -updatedAt -slug", populate);

    if (productInfo) return sendResponseOk(res, 'Product details fetched successfully!', productInfo);
    return sendResponseBadReq(res, 'Invalid product!');
});