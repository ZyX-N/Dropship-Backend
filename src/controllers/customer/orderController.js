import Razorpay from 'razorpay';
import { sendResponseOk, sendResponseBadReq, tryCatch } from '../../helpers/helper.js';
import { listCart_s } from '../../service/CartService.js';
import { detailProduct_s, updateProduct_s } from '../../service/ProductService.js';
import { isValidObjectId } from 'mongoose';
import {
  countDocOrder_s,
  detailOrder_s,
  insertOrder_s,
  listOrder_s,
  updateOrder_s,
} from '../../service/OrderService.js';
import { insertTransaction_s } from '../../service/TransactionService.js';
import httpStatusCodes from '../../../utils/statusCodes.js';
import { detailFile_s } from '../../service/FileService.js';

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
    };

    let orderData = await insertOrder_s(orderInfo);

    const transactionData = {
      userId: orderInfo.userId,
      orderDbId: orderData._id,
      orderId: orderInfo.orderId,
      amount: orderInfo.totalPrice,
      currency: 'INR',
    };
    let transactionDetails = await insertTransaction_s(transactionData);

    await updateOrder_s({ _id: orderData._id }, { transactionDbId: transactionDetails._id });

    await updateProduct_s({ _id: product }, { stock: productInfo.stock - quantity });
    return sendResponseOk(res, 'Order placed successfully!', orderData);
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

export const orderList = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let { all } = req.body;

  const page = Number(req.body?.page || 1);
  const count = Number(req.body?.count || 10);

  let data = await listOrder_s(
    {
      userId: user._id,
    },
    'orderId paymentMethod paymentStatus shippingMethod isOrderCancelAble totalMrp totalPrice invoiceNo shippingCost totalAmountToPay createdAt productDetails.title productDetails.image',
    [],
    !all,
    page,
    count,
  );

  const serverPrefix = `${req.protocol}://${req.headers.host}/image/`;

  data = await Promise.all(
    data.map(async (item) => {
      item.productDetails = await Promise.all(
        item.productDetails.map(async (prod) => {
          let imgs = [];
          for (let img of prod.image) {
            let imgData = await detailFile_s({ _id: img }, 'path filename');
            if (imgData) {
              const imgUrl = `${serverPrefix}${imgData?.filename}`;
              imgs.push(imgUrl);
            }
          }
          prod.image = imgs;
          return prod;
        }),
      );
      return item;
    }),
  );

  const totalCount = await countDocOrder_s({
    userId: user._id,
  });

  return res.status(httpStatusCodes.OK).json({
    status: true,
    msg: 'Order list fetched successfully!',
    data: data,
    totalCount: totalCount,
  });
});

export const orderDetails = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let { id } = req.params;

  const populate = [
    {
      path: 'shippingAddressId',
      select: 'name contact state city house area pincode',
      match: { isDeleted: false },
      populate: [
        { path: 'state', select: 'name', match: { isDeleted: false } },
        { path: 'city', select: 'name', match: { isDeleted: false } },
        { path: 'pincode', select: 'code', match: { isDeleted: false } },
      ],
    },
  ];

  let data = await detailOrder_s(
    {
      orderId: id,
      userId: user._id,
    },
    'orderId paymentMethod paymentStatus shippingMethod isOrderCancelAble totalMrp totalPrice invoiceNo shippingCost totalAmountToPay createdAt productDetails.title productDetails.status productDetails.reason productDetails.rating productDetails.title productDetails.image productDetails.price productDetails.strikePrice productDetails.amountToPay productDetails.quantity shippingAddressId',
    populate,
  );

  if (!data) {
    return sendResponseBadReq(res, 'Invalid order');
  }

  const serverPrefix = `${req.protocol}://${req.headers.host}/image/`;

  data.productDetails = await Promise.all(
    data.productDetails.map(async (prod) => {
      let imgs = [];
      for (let img of prod.image) {
        let imgData = await detailFile_s({ _id: img }, 'path filename');
        if (imgData) {
          const imgUrl = `${serverPrefix}${imgData?.filename}`;
          imgs.push(imgUrl);
        }
      }
      prod.image = imgs;
      return prod;
    }),
  );

  return sendResponseOk(res, 'Order list fetched successfully!', data);
});
