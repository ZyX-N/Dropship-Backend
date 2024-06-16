import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import Cart from '../../models/Cart.js';
import VendorProduct from '../../models/VendorProduct.js';

// export const addProductToCart = async (req, res) => {
//   try {
//     let user = req.apiUser;

//     let checkExist = await Cart.findOne({ product: req.body.product, user: user._id });

//     if (checkExist) {
//       return sendResponseWithoutData(res, 400, false, 'Product already in the cart!');
//     }

//     let { deliveryDate, } = req.body;

//     let productInfo = await VendorProduct.findOne({ _id: req.body.product }).populate([{ path: 'segment' }]);


//     if (productInfo.segment.slug !== 'garden_galleria' && productInfo.segment.slug !== 'cakes' && productInfo.segment.slug !== 'flowers') {
//       return sendResponseWithoutData(res, 400, false, "This product is not available for 'add to cart'");
//     }

//     let deliveryTime = '00:00';
//     if ('deliveryTime' in req.body && req.body.deliveryTime) {
//       let [hrs, min] = req.body.deliveryTime.split(':');
//       if (Number(hrs) && Number(min) && Number(hrs) >= 0 && Number(hrs) < 24 && Number(min) >= 0 && Number(min) < 60) {
//         deliveryTime = `${hrs}:${min}`;
//       }
//     }




//     let cartProduct = await Cart.create({
//       nameOfCake: '',
//       messageForCelebration: '',
//       product: req.body.product,
//       user: user._id,
//       quantity: req.body.quantity,
//       deliveryDate: deliveryDate,
//       deliveryTime: deliveryTime,
//       createdBy: user._id,
//       updatedBy: user._id,
//     });




//     if (cartProduct) {
//       return sendResponseWithoutData(res, 200, true, 'Product added to cart');
//     }

//     return sendResponseWithoutData(res, 400, false, 'Product failed to add in cart');
//   } catch (error) {
//     errorLog(error);
//     sendErrorResponse(res);
//   }
// };

export const listProductOfCart = async (req, res) => {
  try {
    let user = req.apiUser;
    const hostname = req.headers.host;
    const protocol = req.protocol;

    let cartProduct = await Cart.find({ user: user._id })
      .populate({
        path: 'product',
        select:
          '-isActive -isDeleted -approvedBy -isApproved -createdBy -updatedBy -createdAt -updatedAt -__v -rejectReason -status -productId -vendorPrice',
        populate: [
          {
            path: 'image',
            select: '_id url',
          },
          {
            path: 'category',
            select: '_id name',
          },
          {
            path: 'segment',
            select: '_id name',
          },
          {
            path: 'vendor',
            select: '_id name',
          },
        ],
      })
      .select('-createdBy -updatedBy -createdAt -updatedAt -__v')
      .lean();

    if (cartProduct.length > 0) {
      for (let product of cartProduct) {
        if (product.product && product.product.image && 'url' in product.product.image) {
          let url = product.product.image.url.map((item) => {
            return `${protocol}://${hostname}/${item}`;
          });
          product.product.image.url = url;
        }
      }

      return sendResponseWithData(res, 200, true, 'Product cart fetched successfully', cartProduct, true);
    }

    return sendResponseWithData(res, 200, true, 'No products in cart', cartProduct, true);
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const modifyProductFromCart = async (req, res) => {
  try {
    let user = req.apiUser;

    let checkExist = await Cart.findOne({ product: req.body.product, user: user._id });


    if (!checkExist) {
      return sendResponseWithoutData(res, 400, false, 'Invalid product id!');
    }

    const newQuantity = Math.floor(Number(checkExist.quantity) + Number(req.body.quantity));

    if (newQuantity < 0) {
      return sendResponseWithoutData(res, 400, false, 'Invalid quantity provided!');
    }

    if (newQuantity === 0) {
      let removeCartProduct = await Cart.deleteOne({ product: req.body.product, user: user._id });

      if (removeCartProduct.deletedCount > 0) {
        return sendResponseWithoutData(res, 200, true, 'Product removed from cart');
      }
    }

    let updateCartProduct = await Cart.updateOne(
      { product: req.body.product, user: user._id },
      {
        $set: {
          quantity: newQuantity,
        },
      },
    );

    if (updateCartProduct.modifiedCount > 0) {
      return sendResponseWithoutData(res, 200, true, 'Product quantity updated');
    }

    return sendResponseWithoutData(res, 400, false, 'Product quantity failed to updated');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

export const addProductToCart = async (req, res) => {
  try {
    let user = req.apiUser;

    let checkExist = await Cart.findOne({ product: req.body.product, user: user._id });

    if (checkExist) {
      return sendResponseWithoutData(res, 400, false, 'Product already in the cart!');
    }

    let { deliveryDate, } = req.body;

    let productInfo = await VendorProduct.findOne({ _id: req.body.product }).populate([{ path: 'segment' }]);

    if (productInfo.segment.slug !== 'garden_galleria' && productInfo.segment.slug !== 'cakes' && productInfo.segment.slug !== 'flowers') {
      return sendResponseWithoutData(res, 400, false, "This product is not available for 'add to cart'");
    }

    let deliveryTime = '00:00';
    if ('deliveryTime' in req.body && req.body.deliveryTime) {
      let [hrs, min] = req.body.deliveryTime.split(':');
      if (Number(hrs) && Number(min) && Number(hrs) >= 0 && Number(hrs) < 24 && Number(min) >= 0 && Number(min) < 60) {
        deliveryTime = `${hrs}:${min}`;
      }
    }

    let cartProductData = {
      product: req.body.product,
      user: user._id,
      quantity: req.body.quantity,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime,
      createdBy: user._id,
      updatedBy: user._id
    };


    if ('nameOnCake' in req.body) {
      cartProductData.nameOnCake = req.body.nameOnCake;
    }
    if ('messageForCelebration' in req.body) {
      cartProductData.messageForCelebration = req.body.messageForCelebration;
    }

    // Create the cart product
    let cartProduct = await Cart.create(cartProductData);



    if (cartProduct) {
      return sendResponseWithoutData(res, 200, true, 'Product added to cart');
    }

    return sendResponseWithoutData(res, 400, false, 'Product failed to add in cart');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};

