import Razorpay from 'razorpay';
import { sendResponseOk, sendResponseBadReq, tryCatch, makeObjectId } from '../../helpers/helper.js';
import { listCart_s } from '../../service/CartService.js';
import { detailProduct_s, updateProduct_s } from '../../service/ProductService.js';
import { isValidObjectId } from 'mongoose';
import {
  countDocOrder_s,
  detailOrder_s,
  insertOrder_s,
  listOrder_s,
  pipelineOrder_s,
  updateOrder_s,
} from '../../service/OrderService.js';
import { insertTransaction_s } from '../../service/TransactionService.js';
import httpStatusCodes from '../../../utils/statusCodes.js';
import { detailFile_s } from '../../service/FileService.js';

export const orderList = tryCatch(async (req, res) => {
  let user = req.apiUser;

  const page = Number(req.body?.page || 1);
  const count = Number(req.body?.count || 20);
  const search = Number(req.body?.search || '');

  let pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [
          {
            $match: { isDeleted: false },
          },
          {
            $project: {
              name: 1,
              email: 1,
              mobile: 1,
              isVerified: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: { preserveNullAndEmptyArrays: false, path: '$userInfo' },
    },
    {
      $project: {
        orderId: 1,
        userInfo: 1,
        orderFrom: 1,
        paymentMethod: 1,
        paymentStatus: 1,
        shippingMethod: 1,
        isOrderCancelAble: 1,
        totalMrp: 1,
        totalPrice: 1,
        totalAmountToPay: 1,
        orderId: 1,
        transactionDbId: 1,
        updatedAt: 1,
        'productDetails.title': 1,
        'productDetails.price': 1,
        'productDetails.strikePrice': 1,
        'productDetails.amountToPay': 1,
        'productDetails.quantity': 1,
      },
    },
  ];

  // if (pagination) {
  //   query = query.skip((page - 1) * count);
  //   query = query.limit(count);
  // }

  let data = await pipelineOrder_s(pipeline);

  const serverPrefix = `${req.protocol}://${req.headers.host}/image/`;

  // data = await Promise.all(
  //   data.map(async (item) => {
  //     item.productDetails = await Promise.all(
  //       item.productDetails.map(async (prod) => {
  //         let imgs = [];
  //         for (let img of prod.image) {
  //           let imgData = await detailFile_s({ _id: img }, 'path filename');
  //           if (imgData) {
  //             const imgUrl = `${serverPrefix}${imgData?.filename}`;
  //             imgs.push(imgUrl);
  //           }
  //         }
  //         prod.image = imgs;
  //         return prod;
  //       }),
  //     );
  //     return item;
  //   }),
  // );

  // const totalCount = await countDocOrder_s({
  //   userId: user._id,
  // });

  return res.status(httpStatusCodes.OK).json({
    status: true,
    msg: 'Order list fetched successfully!',
    data: data,
    // totalCount: totalCount,
  });
});

export const orderDetail = tryCatch(async (req, res) => {
  let user = req.apiUser;
  let { id } = req.params;
  const serverPrefix = `${req.protocol}://${req.headers.host}/`;

  let pipeline = [
    {
      $match: { _id: makeObjectId(id) },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [
          {
            $match: { isDeleted: false },
          },
          {
            $project: {
              name: 1,
              email: 1,
              mobile: 1,
              isVerified: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: { preserveNullAndEmptyArrays: false, path: '$userInfo' },
    },
    {
      $lookup: {
        from: 'files',
        localField: 'productDetails.image',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [
          {
            $project: {
              path: { $concat: [serverPrefix, 'image/', '$filename'] },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'addresses',
        localField: 'shippingAddressId',
        foreignField: '_id',
        as: 'shippingAddress',
        pipeline: [
          {
            $lookup: {
              from: 'states',
              localField: 'state',
              foreignField: '_id',
              as: 'state',
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          {
            $unwind: { preserveNullAndEmptyArrays: false, path: '$state' },
          },
          {
            $lookup: {
              from: 'cities',
              localField: 'city',
              foreignField: '_id',
              as: 'city',
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          {
            $unwind: { preserveNullAndEmptyArrays: false, path: '$city' },
          },
          {
            $lookup: {
              from: 'pincodes',
              localField: 'pincode',
              foreignField: '_id',
              as: 'pincode',
              pipeline: [{ $project: { code: 1 } }],
            },
          },
          {
            $unwind: { preserveNullAndEmptyArrays: false, path: '$pincode' },
          },
          {
            $project: {
              name: 1,
              contact: 1,
              state: 1,
              city: 1,
              pincode: 1,
              house: 1,
              area: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: { preserveNullAndEmptyArrays: false, path: '$shippingAddress' },
    },
    {
      $project: {
        orderId: 1,
        userInfo: 1,
        orderFrom: 1,
        paymentMethod: 1,
        paymentStatus: 1,
        shippingMethod: 1,
        shippingAddress: 1,
        isOrderCancelAble: 1,
        totalMrp: 1,
        totalPrice: 1,
        totalAmountToPay: 1,
        orderId: 1,
        transactionDbId: 1,
        updatedAt: 1,
        'productDetails.title': 1,
        'productDetails.description': 1,
        'productDetails.status': 1,
        'productDetails.price': 1,
        'productDetails.strikePrice': 1,
        'productDetails.amountToPay': 1,
        'productDetails.quantity': 1,
        'productDetails.category': 1,
        'productDetails.image': 1,
      },
    },
  ];

  let data = await pipelineOrder_s(pipeline);

  // const serverPrefix = `${req.protocol}://${req.headers.host}/`;

  // data = await Promise.all(
  //   data.map(async (item) => {
  //     item.productDetails = await Promise.all(
  //       item.productDetails.map(async (prod) => {
  //         let imgs = [];
  //         for (let img of prod.image) {
  //           let imgData = await detailFile_s({ _id: img }, 'path filename');
  //           if (imgData) {
  //             const imgUrl = `${serverPrefix}${imgData?.filename}`;
  //             imgs.push(imgUrl);
  //           }
  //         }
  //         prod.image = imgs;
  //         return prod;
  //       }),
  //     );
  //     return item;
  //   }),
  // );

  // const totalCount = await countDocOrder_s({
  //   userId: user._id,
  // });

  return res.status(httpStatusCodes.OK).json({
    status: true,
    msg: 'Order details fetched successfully!',
    data: data?.length > 0 ? data[0] : null,
  });
});

export const orderStatusUpdate = tryCatch(async (req, res) => {
  let { id, status } = req.params;

  let data = await updateOrder_s({ _id: id }, { 'productDetails.status': status });

  if (data) {
    await updateOrder_s({ _id: id }, { isOrderCancelAble: false });
  }

  return res.status(httpStatusCodes.OK).json({
    status: true,
    msg: 'Order status updated successfully!',
  });
});

// export const orderDetails = tryCatch(async (req, res) => {
//   let user = req.apiUser;
//   let { id } = req.params;

//   const populate = [
//     {
//       path: 'shippingAddressId',
//       select: 'name contact state city house area pincode',
//       match: { isDeleted: false },
//       populate: [
//         { path: 'state', select: 'name', match: { isDeleted: false } },
//         { path: 'city', select: 'name', match: { isDeleted: false } },
//         { path: 'pincode', select: 'code', match: { isDeleted: false } },
//       ],
//     },
//   ];

//   let data = await detailOrder_s(
//     {
//       orderId: id,
//       userId: user._id,
//     },
//     'orderId paymentMethod paymentStatus shippingMethod isOrderCancelAble totalMrp totalPrice invoiceNo shippingCost totalAmountToPay createdAt productDetails.title productDetails.status productDetails.reason productDetails.rating productDetails.title productDetails.image productDetails.price productDetails.strikePrice productDetails.amountToPay productDetails.quantity shippingAddressId',
//     populate,
//   );

//   if (!data) {
//     return sendResponseBadReq(res, 'Invalid order');
//   }

//   const serverPrefix = `${req.protocol}://${req.headers.host}/image/`;

//   data.productDetails = await Promise.all(
//     data.productDetails.map(async (prod) => {
//       let imgs = [];
//       for (let img of prod.image) {
//         let imgData = await detailFile_s({ _id: img }, 'path filename');
//         if (imgData) {
//           const imgUrl = `${serverPrefix}${imgData?.filename}`;
//           imgs.push(imgUrl);
//         }
//       }
//       prod.image = imgs;
//       return prod;
//     }),
//   );

//   return sendResponseOk(res, 'Order list fetched successfully!', data);
// });
