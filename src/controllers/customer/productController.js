import { sendResponseOk, sendResponseBadReq, tryCatch } from "../../helpers/helper.js";
import httpStatusCodes from "../../../utils/statusCodes.js";
import { detailProduct_s, listProduct_s } from "../../service/ProductService.js";

export const productList = tryCatch(async (req, res) => {
    const page = Number(req.query?.page || 1);
    const count = Number(req.query?.count || 10);
    const pagination = req.query?.all === 'true' ? false : true;
    const search = req.query?.search || "";

    let productList = await listProduct_s(search, pagination, page, count);
    return res.status(httpStatusCodes.OK).json({
        status: true,
        msg: "Product list fetched successfully!",
        data: productList.data,
        totalCount: productList.totalCount
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