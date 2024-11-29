import Razorpay from 'razorpay';
import { sendResponseOk, sendResponseBadReq, tryCatch } from '../../helpers/helper.js';
import { listCart_s } from '../../service/CartService.js';
import { detailProduct_s, updateProduct_s } from '../../service/ProductService.js';
import { isValidObjectId } from 'mongoose';
import { insertOrder_s } from '../../service/OrderService.js';

const instance = new Razorpay({
  key_id: 'rzp_test_Y18ZHuyYBnqQ7z',
  key_secret: 'TotIrflmqrN98I8AVTcS38Yq',
});

export const orderPlace = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let { type, product, quantity, address } = req.body;

  if (type === 'product') {
    if (!isValidObjectId(product) || !(await detailProduct_s({ _id: product }))) {
      return sendResponseBadReq(res, 'Invalid product!');
    }
    if (!quantity || isNaN(quantity)) {
      return sendResponseBadReq(res, 'Invalid quantity or quantity not provided!');
    }

    let productInfo = await detailProduct_s({ _id: product });
    if (quantity > productInfo.stock) {
      return sendResponseBadReq(res, `Only ${productInfo.stock} left! Please reduce the quantity and try again.`);
    }

    const amount = productInfo.price * quantity;

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: 'abcX123',
      partial_payment: false,
      notes: {
        xNote: '9995c',
      },
    };

    let orderDetails = await instance.orders.create(options);

    if (orderDetails && 'error' in orderDetails) {
      return sendResponseBadReq(res, orderDetails.error?.description);
    }

    let productData = {
      title: productInfo.title,
      description: productInfo.description,
      status: 'pending',
      rating: productInfo.rating,
      adminRating: productInfo.adminRating,
      productId: productInfo._id,
      category: productInfo.category,
      image: productInfo.image,
      price: productInfo.price,
      strikePrice: productInfo.strikePrice,
      quantity: quantity,
      amountToPay: amount,
    };

    let orderInfo = {
      orderId: orderDetails.id,
      userId: user._id,
      orderFrom: type,
      paymentMethod: 'online',
      paymentStatus: 'unpaid',
      shippingMethod: 'free',
      isOrderCancelAble: true,
      totalMrp: productInfo.strikePrice * quantity,
      totalPrice: amount,
      shippingAddressId: address,
      invoiceNo: 'TEST_xyz',
      shippingCost: 0,
      totalAmountToPay: amount,
      productDetails: [productData],
      // transactionDbId
    };

    await insertOrder_s(orderInfo);
    await updateProduct_s({ _id: product }, { stock: productInfo.stock - quantity });

    return sendResponseOk(res, 'Order placed successfully!', orderDetails);
  } else if (type === 'cart') {
    let cartItems = await listCart_s(
      {
        user: user._id,
      },
      'product quantity',
      [
        {
          path: 'product',
          select: 'category image price rating stock slug strikePrice title',
          populate: [
            {
              path: 'category',
              select: 'title',
              match: { isDeleted: false, isActive: true },
            },
            { path: 'image', select: 'filename' },
          ],
          match: { isDeleted: false, isActive: true },
        },
      ],
    );

    for (let item of cartItems) {
      if (item?.product?.stock < item?.quantity) {
        return sendResponseBadReq(res, 'Invalid quantity of product or Product out of stock');
      }
    }
  }

  return sendResponseOk(res, 'Order placed successfully!');
});
