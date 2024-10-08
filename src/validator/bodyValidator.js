import { validationResult } from "express-validator";
import httpStatusCodes from "../../utils/statusCodes.js";

const bodyValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
            status: false,
            msg: errors?.array()[0]?.msg
        });
    }
    next();

}

export default bodyValidation;