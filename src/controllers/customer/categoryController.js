import { listCategory_s } from "../../service/CategoryService.js";
import { sendResponseOk, tryCatch } from "../../helpers/helper.js";

export const categoryList = tryCatch(async (req, res) => {
    const categoryList = await listCategory_s({ isActive: true }, "-isActive -createdBy -updatedBy -createdAt -updatedAt -isDeleted -__v");
    return sendResponseOk(res, 'Category list fetched successfully!', categoryList);
})