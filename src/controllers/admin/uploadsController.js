import { join } from 'path';
import fs from "fs";
import { insertFile_s } from "../../service/FileService.js";
import { tryCatch, removeSpace, sendResponseCreated } from "../../helpers/helper.js";
const parentUploadPath = 'public';

if (!fs.existsSync(parentUploadPath)) {
    fs.mkdirSync(parentUploadPath);
}

export const imageUpload = tryCatch(async (req, res) => {
    const uploadPath = parentUploadPath+"/img";
    const user = req.apiUser;
    let data = req.files.file;
    let multipleFile = Array.isArray(data);
    const currentTimeStamp = Date.now();

    if (!multipleFile) {
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        let nameArr = data.name.split(".");
        const ext = nameArr.pop();
        nameArr = nameArr.join(".");
        
        const filteredName = removeSpace(nameArr);
        let filename = `${filteredName}-${currentTimeStamp}.${ext}`.toLowerCase();
        let fullFileName = join(uploadPath, filename);

        const imageDataBuffer = Buffer.from(data.data);
        await fs.promises.writeFile(fullFileName, imageDataBuffer);

        const newData = {
            path: fullFileName,
            filename: filename,
            createdBy: user._id,
            updatedBy: user._id,
        }
        let saveFile = await insertFile_s(newData)
        return sendResponseCreated(res, 'File uploaded successfully!', saveFile._id || null);
    }

    return sendResponseBadReq(res, 'Multiple files not allowed!');
});