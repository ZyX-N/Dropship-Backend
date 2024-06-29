import jwt from 'jsonwebtoken';
import { JWT_SECRET_TOKEN } from '../../config/config.js';
import { authValues, sendErrorResponse, sendResponseWithoutData } from '../helpers/helper.js';
import { detailRole_s } from "../service/RoleService.js";

export const adminAuthentication = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return sendResponseWithoutData(res, 401, false, 'Unauthorized');
        }

        jwt.verify(token, JWT_SECRET_TOKEN, async function (err) {
            if (err) {
                console.log(err);
                return res.status(401).send({ status: false, msg: 'Token Expired' });
            } else {
                var decoded = await authValues(token);
                let roles = await detailRole_s({ title: 'admin' });
                if (decoded && roles && decoded.role.toString() === roles._id.toString()) {
                    req.apiUser = decoded;
                    return next();
                }
                return res.status(401).send({ status: false, msg: 'Invalid Token' });
            }
        });
    } catch (err) {
        console.log(err);
        return sendErrorResponse(res);
    }
};