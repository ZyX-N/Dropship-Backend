import { detailSetting_s } from "../../service/SettingsService.js";
import { sendResponseOk, tryCatch } from "../../helpers/helper.js";

export const settingList = tryCatch(async (req, res) => {
    return sendResponseOk(res, 'Settings fetched successfully!', await detailSetting_s());
})