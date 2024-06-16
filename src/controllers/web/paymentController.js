import crypto from 'crypto';
import { errorLog } from '../../../config/logger.js';
import { sendErrorResponse, sendResponseWithoutData } from '../../helpers/helper.js';
import Order from '../../models/Order.js';
import Transaction from '../../models/Transaction.js';
import { RAZORPAY_KEY_SECRET } from '../../../config/config.js';
import Cart from '../../models/Cart.js';

export const paymentVerification = async (req, res) => {
  try {
    const { order_id, payment_id } = req.body;
    const razorpay_signature = req.headers['x-razorpay-signature'];

    if (!razorpay_signature) {
      return sendResponseWithoutData(res, 400, false, 'Invalid or no signature!');
    }

    let hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);

    const generated_signature = hmac.update(order_id + '|' + payment_id).digest('hex');

    if (generated_signature === razorpay_signature) {
      await Transaction.updateOne({ transactionId: order_id }, { $set: { status: 'confirmed' } });

      let transactionDetails = await Transaction.findOne({ transactionId: order_id }).lean();

      if (!transactionDetails) {
        return sendResponseWithoutData(res, 400, false, 'Signature matched but invalid transaction details!');
      }

      await Order.updateOne(
        { transactionDbId: transactionDetails._id },
        { $set: { paymentStatus: 'paid', status: 'confirmed' } },
      );

      let orderDetails = await Order.findOne({ transactionDbId: transactionDetails._id }).lean();

      if ('orderFrom' in orderDetails && orderDetails.orderFrom === 'cart') {
        let user = req.apiUser;
        await Cart.deleteMany({ user: user._id });
      }

      return sendResponseWithoutData(res, 200, true, 'Payment verified successfully');
    }

    await Transaction.updateOne({ transactionId: order_id }, { $set: { status: 'cancelled' } });
    let transactionDetails = await Transaction.findOne({ transactionId: order_id }).lean();

    if (!transactionDetails) {
      return sendResponseWithoutData(res, 400, false, 'Invalid transaction details!');
    }

    await Order.updateOne(
      { transactionDbId: transactionDetails._id },
      { $set: { paymentStatus: 'unpaid', status: 'cancelled' } },
    );
    return sendResponseWithoutData(res, 400, false, 'Payment verification failed!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
