import { detailCategory_s } from "../../service/CategoryService.js";
import { sendResponseOk, sendResponseBadReq, tryCatch, sendResponseWithoutData } from "../../helpers/helper.js";
import { isValidObjectId } from "mongoose";
import httpStatusCodes from "../../../utils/statusCodes.js";
import { detailProduct_s, insertProduct_s, listProduct_s } from "../../service/ProductService.js";

export const createProduct = tryCatch(async (req, res) => {
    let { title, description, image, category, price, stock } = req.body;

    if (!isValidObjectId(category) || !await detailCategory_s({ _id: category })) return sendResponseBadReq(res, "Invalid category id!");

    if (await detailProduct_s({ title: title })) return sendResponseBadReq(res, "Product with thid title already exists!");

    let newData = {
        title,
        description,
        image,
        category,
        price,
        stock,
        createdBy: req.apiUser._id,
        updatedBy: req.apiUser._id
    }

    if ('strikePrice' in req.body) {
        if (req.body.strikePrice < price) return sendResponseBadReq(res, "strikePrice value should be greater than price");
        newData.strikePrice = req.body.strikePrice;
    }

    if ('hindiTitle' in req.body && req.body.hindiTitle) newData.hindiTitle = req.body.hindiTitle;

    if ('hindiDescription' in req.body && req.body.hindiDescription) newData.hindiDescription = req.body.hindiDescription;


    let insertStatus = await insertProduct_s(newData);
    if (!insertStatus) return sendResponseBadReq(res, 'Product insertion failed! try again in sometime or report the issue!')

    return sendResponseWithoutData(res, httpStatusCodes.CREATED, true, 'Product inserted successfully!');
});

export const getProductList = tryCatch(async (req, res) => {
    const page = Number(req.query?.page || 1);
    const count = Number(req.query?.count || 10);
    const all = Boolean(req.query?.all || false) ? false : true;

    let productList = await listProduct_s({}, "-isDeleted -__v", all, page, count);
    return res.status(httpStatusCodes.OK).json({
        status:true,
        msg:"Product list fetched successfully!",
        data:productList,
        totalCount:10
    })
});

// export const getCategoryDetails = tryCatch(async (req, res) => {
//     if (!isValidObjectId(req.params.id)) return sendResponseBadReq(res, "Invalid category id!");
//     let categoryInfo = await detailCategory_s({ _id: req.params.id }, "-isDeleted -__v");
//     if (categoryInfo) return sendResponseOk(res, 'Category details fetched successfully!', categoryInfo);
//     return sendResponseBadReq(res, 'Invalid category id!');
// });

// export const editCategory = tryCatch(async (req, res) => {
//     if (!isValidObjectId(req.params.id) || !await detailCategory_s({ _id: req.params.id })) return sendResponseBadReq(res, "Invalid category id!");
//     // console.log(req.apiUser);
//     let updatedData = {
//         title: req.body.title,
//         isActive: req.body.active,
//         // updatedBy: req.apiUser._id,
//         updatedAt: Date.now()
//     }

//     if ('slug' in req.body && req.body.slug) updatedData.slug = req.body.slug;

//     let updateStatus = await updateCategory_s({ _id: req.params.id }, updatedData);
//     if (updateStatus) return sendResponseOk(res, 'Category updated successfully!');
//     return sendResponseBadReq(res, 'Invalid category id!');
// });

// export const deleteCategory = tryCatch(async (req, res) => {
//     if (!isValidObjectId(req.params.id) || !await detailCategory_s({ _id: req.params.id })) return sendResponseBadReq(res, "Invalid category id!");
//     await deleteCategory_s({ _id: req.params.id });
//     return sendResponseOk(res, 'Category deleted successfully!');
// });