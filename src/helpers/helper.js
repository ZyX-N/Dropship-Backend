import fs from 'fs';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { join } from 'path';
import { Types, isValidObjectId } from 'mongoose';
import User from '../models/User.js';
import File from '../models/File.js';
import {
  JWT_EXPIRES_IN,
  JWT_SECRET_TOKEN,
  FIRST_ORDER_ID_PREFIX,
  FIRST_ORDER_ID_POSTFIX,
  FIRST_INVOICE_ID_PREFIX,
  FIRST_INVOICE_ID_POSTFIX,
} from '../../config/config.js';
import { imageValiation } from '../validators/imageValidator.js';
import Cart from '../models/Cart.js';
import FilterValue from '../models/FilterValue.js';

import { writeFile } from 'fs/promises';
import FilterCategory from '../models/FilterCategory.js';
import Order from '../models/Order.js';

// ******************* Variable Path Name Start *******************

const uploadPath = 'public';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// ******************* Variable Path Name End *********************

export const sendResponseWithData = (res, statusCode, status, msg, data, length = false) => {
  if (length) {
    return res.status(statusCode).json({
      status,
      msg,
      data,
      count: data.length,
    });
  }
  return res.status(statusCode).json({
    status,
    msg,
    data,
  });
};

export const sendResponseWithoutData = (res, statusCode, status, msg) => {
  return res.status(statusCode).json({
    status,
    msg,
    data: null,
  });
};

export const sendErrorResponse = (res) => {
  return res.status(500).send({ status: false, msg: 'Something Went Wrong' });
};

export const getJwtToken = (data) => {
  try {
    return jwt.sign(data, JWT_SECRET_TOKEN, {
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getJwtValue = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET_TOKEN);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const hashPassword = async (password) => bcrypt.hash(password, 10);

export const matchPassword = async (plainString, hashedString) => await bcrypt.compare(plainString, hashedString);

export const authValues = async (authToken) => {
  try {
    let result = jwt.verify(authToken, JWT_SECRET_TOKEN);
    let user = await User.findOne({ _id: result.id, isDeleted: false }).lean();
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const removeSpace = (str, joinElement = '_') => str.replaceAll(/\s+/g, joinElement);

export const fileUplaod = async (files, uploaderId = '') => {
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    const currentTimeStamp = Date.now();
    let response = {
      status: false,
      data: {},
      message: 'Fail to upload!',
    };
    let fileArr = [];

    let index = 0;
    for (const file of files) {
      let filename = `${currentTimeStamp}${index}_${removeSpace(file.name)}`;
      let fullFileName = join(uploadPath, filename);
      let isImageValid = await imageValiation(file);

      if (isImageValid.status) {
        fileArr.push({ name: fullFileName, file: isImageValid.file });
      } else {
        response.message = isImageValid.message;
        return response;
      }
      index++;
    }

    for (const x of fileArr) {
      const imageDataBuffer = Buffer.from(x.file.data);
      await writeFile(x.name, imageDataBuffer);
      // await x.file.mv(x.name);
    }

    let urlArr = fileArr.map((item) => {
      return item.name;
    });

    let saveFile = await File.create({
      url: urlArr,
      createdBy: uploaderId,
      updatedBy: uploaderId,
    });

    if (saveFile) {
      response.status = true;
      response.data = saveFile;
      response.message = 'Image uploaded successfully';
    } else {
      response.message = 'Fail to upload image';
    }

    return response;
  } catch (err) {
    console.error(err);
    return {
      status: false,
      message: 'Fail to upload!',
    };
  }
};

export const makeObjectId = (id) => new Types.ObjectId(id);

export const mailForgotPasswordTemplate = (data) => {
  const template = `
<div style="margin: 0; padding: 20px 0 20px 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Forgot Password</h1>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear ${data.name},</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Please click the button below to reset your password:</p>
    <a href="${data.url}" target="_blank" style="display: inline-block; padding: 5px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 3px;"><p style="font-size: 16px;">Reset Password</p></a>
    
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you did not request this, please ignore this email.</p>
    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you!</p>
</div>
<div style="text-align: center; color: #999; font-size: 12px;">This is an automated email. Please do not reply.</div>
</div>`;
  return template;
};

export const mailOrderPlaceTemplate = (data) => {
  const template = `
  <div style="margin: 0; padding: 20px 0 20px 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Dear ${data.name},</p>
      <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Your order has been booked with order id:${data.orderId}.</h1>
      <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;"><b>Support Contact</b>: 1800400252</p>
      <p style="color: #666; font-size: 16px;  line-height: 1.5; margin-bottom: 20px;"> <b>Support Email</b>: gamleWala@gmail.com</p>
       
      <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you did not request this, please ignore this email.</p>
      <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you!</p>
  </div>
  <div style="text-align: center; color: #999; font-size: 12px;">This is an automated email. Please do not reply.</div>
  </div>`;
  return template;
};

export const generateSixDigitOtp = () => Math.floor(100000 + Math.random() * 900000);

export const getTimePlusXMinutes = (timeToIncrese = 30) => {
  const currentTime = new Date();
  const ISTOffset = 330;
  const newTime = new Date(currentTime.getTime() + (timeToIncrese + ISTOffset) * 60000);
  return newTime;
};

export const removeProductsFromCart = async (productId = null) => {
  if (productId && isValidObjectId(productId)) {
    await Cart.deleteMany({ product: productId });
    return true;
  }
  return false;
};

export const getFilterValueById = async (id = null) => {
  if (!id) {
    return null;
  }
  id = String(id);

  let filterCategoryDataValue = await FilterValue.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate({ path: 'filterCategoryId', select: 'name field type' })
    .select('-isDeleted -__v')
    .lean();

  return filterCategoryDataValue;
};

export const getSortingFilter = (name = null) => {
  try {
    if (!name) {
      return null;
    }
    name = String(name);

    switch (name) {
      case 'ascending':
        return { price: 1 };
      case 'descending':
        return { price: -1 };
      case 'ascending_rating':
        return { rating: 1 };
      case 'descending_rating':
        return { price: -1 };
      case 'discount':
        return { offer: -1 };

      default:
        return null;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const addFilter = async (name = null, title = null, match = null, min = null, max = null) => {
  try {
    if (!name || !title) {
      return null;
    }

    name = String(name);
    title = String(title);

    let filterCategoryDetails = await FilterCategory.findOne({ name, isDeleted: false }).lean();

    if (!filterCategoryDetails) {
      return null;
    }

    let dataObj = {
      filterCategoryId: filterCategoryDetails._id,
      title: title,
    };

    if (filterCategoryDetails.type === 'match') {
      if (!match) {
        return null;
      }
      dataObj.match = match;
    } else if (filterCategoryDetails.type === 'range') {
      if (!min && !max) {
        return null;
      }
      dataObj.min = min || null;
      dataObj.max = max || null;
    }

    let createFilter = await FilterValue.create(dataObj);

    return createFilter;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateRandomCouponCode = (length = 15) => {
  try {
    if (isNaN(length) || length > 50) {
      return null;
    }

    let result = '';
    const charLen = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charLen);
      result += characters.charAt(randomIndex);
    }

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getPercentageToNumber = (number = null, percent = null) => {
  try {
    if (isNaN(number) || isNaN(percent)) {
      return null;
    }

    return (number * percent) / 100;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateOrderId = async () => {
  try {
    const spliter = FIRST_ORDER_ID_PREFIX;
    let previousOrderId = null;

    let lastOrderId = await Order.find().sort({ createdAt: -1 }).limit(1);

    if (lastOrderId.length === 0) {
      previousOrderId = `${FIRST_ORDER_ID_PREFIX}${FIRST_ORDER_ID_POSTFIX}`;
      return previousOrderId;
    }

    if (lastOrderId.length > 0) {
      previousOrderId = lastOrderId[0].orderId;
    }

    if (previousOrderId && previousOrderId.split(spliter).length === 2) {
      let orderNumber = Number(previousOrderId.split(spliter)[1]);

      if (isNaN(orderNumber)) {
        return null;
      }
      orderNumber++;
      let arrangedNumber = String(orderNumber).padStart(5, '0');

      const newOrderId = previousOrderId.split(spliter)[0] + spliter + arrangedNumber;

      return newOrderId;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateInvoiceId = async () => {
  try {
    const spliter = 'ZX';
    let previousInvoiceId = null;
    const currentYear = new Date().getFullYear();

    let lastOrderId = await Order.find().sort({ createdAt: -1 }).limit(1);

    if (lastOrderId.length === 0) {
      previousInvoiceId = `${FIRST_INVOICE_ID_PREFIX}${currentYear}ZX${FIRST_INVOICE_ID_POSTFIX}`;
      return previousInvoiceId;
    }

    if (lastOrderId.length > 0) {
      previousInvoiceId = lastOrderId[0].invoiceNo;
    }

    if (previousInvoiceId && previousInvoiceId.split(spliter).length === 2) {
      let invoiceNumber = Number(previousInvoiceId.split(spliter)[1]);

      if (isNaN(invoiceNumber)) {
        return null;
      }
      invoiceNumber++;
      let arrangedNumber = String(invoiceNumber).padStart(5, '0');

      const newOrderId = previousInvoiceId.split(spliter)[0] + spliter + arrangedNumber;
      return newOrderId;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// export const makeValidImageUrl = async (id) => {
//   if (!id) {
//     return [];
//   }

//   let imageUrl = await File.findOne({ _id: id, isDeleted: false }).lean();
//   if (!imageUrl) {
//     return [];
//   }

//   let urls = imageUrl.url.map((item) => {
//     return `${protocol}://${hostname}/${item}`;
//   });

//   return urls;
// };
