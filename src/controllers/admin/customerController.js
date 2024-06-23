import { insertCategory_s } from "../../service/CategoryService.js";
import { sendResponseOk, sendResponseBadReq, tryCatch } from "../../helpers/helper.js";

export const createCategory = tryCatch(async (req, res) => {
    let { title } = req.body;
    let newData = {
        title,
        createdBy,
        updatedBy
    }

    if (req.body.slug) {
        newData.slug = req.body.slug;
    } else {
        newData.slug = req.body.title.replaceAll(" ", "-");
    }

    let insertStatus = await insertCategory_s(newData);
    if (!insertStatus) return sendResponseBadReq(res, 'Category insertion failed! try again in sometime or report the issue!')

    return sendResponseOk(res, 'Category inserted successfully!');
})