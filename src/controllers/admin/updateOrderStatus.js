import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import Order from "../../models/Order.js";

export const getAllOrders = async (req, res) => {
    try {

        let data = await Order.find();
        if (data) {
            return sendResponseWithData(res, 200, true, 'Orders List fetched Successfully!', data);
        } else {
            return sendResponseWithoutData(res, 400, false, 'No data available!');
        }
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};
export const upateOrderStatus = async (req, res) => {
    try {
        let { id } = req.body;
        let data = await Order.updateOne({ _id: id }, { $set: { status: req.body.status } });
        if (data) {
            return sendResponseWithoutData(res, 200, true, 'Update order status successfully!',);
        } else {
            return sendResponseWithoutData(res, 400, false, 'Fail to update status!');
        }
    } catch (error) {
        errorLog(error);
        return sendErrorResponse(res);
    }
};