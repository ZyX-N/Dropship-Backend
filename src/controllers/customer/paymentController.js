import crypto from 'crypto';
import { sendResponseBadReq, sendResponseOk, tryCatch } from '../../helpers/helper.js';
import { RAZORPAY_KEY_SECRET } from '../../../config/config.js';
import { detailTransaction_s, updateTransaction_s } from '../../service/TransactionService.js';
import { updateOrder_s } from '../../service/OrderService.js';

export const verifyPayment = tryCatch(async (req, res) => {
  const { order_id, payment_id, status } = req.body;

  if (!status) {
    return sendResponseBadReq(res, 'Payment error!');
  }

  const razorpay_signature = req.headers['x-razorpay-signature'];

  if (!razorpay_signature) {
    return sendResponseBadReq(res, 'Invalid or no signature!');
  }

  let hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);

  const generated_signature = hmac.update(order_id + '|' + payment_id).digest('hex');

  if (generated_signature === razorpay_signature) {
    await updateTransaction_s({ orderId: order_id }, { $set: { status: 'confirmed' } });

    let transactionDetails = await detailTransaction_s({ orderId: order_id });

    if (!transactionDetails) {
      return sendResponseBadReq(res, 'Signature matched but invalid transaction details!');
    }

    await updateOrder_s({ transactionDbId: transactionDetails._id }, { $set: { paymentStatus: 'paid' } });

    return sendResponseOk(res, 'Payment verified successfully');
  }

  await updateTransaction_s({ order_id: order_id }, { $set: { status: 'cancelled' } });
  let transactionDetails = await detailTransaction_s({ order_id: order_id });

  if (!transactionDetails) {
    return sendResponseBadReq(res, 'Invalid transaction details!');
  }

  await updateOrder_s(
    { transactionDbId: transactionDetails._id },
    {
      $set: {
        paymentStatus: 'unpaid',
      },
    },
  );

  return sendResponseBadReq(res, 'Payment verification failed!');
});
