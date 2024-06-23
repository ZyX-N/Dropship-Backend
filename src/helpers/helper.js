import fs from 'fs';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { join } from 'path';
import { Types } from 'mongoose';
// import File from '../models/File.js';
import {
  JWT_EXPIRES_IN,
  JWT_SECRET_TOKEN,
  FIRST_ORDER_ID_PREFIX,
  FIRST_ORDER_ID_POSTFIX,
  FIRST_INVOICE_ID_PREFIX,
  FIRST_INVOICE_ID_POSTFIX,
} from '../../config/config.js';
// import { imageValiation } from '../validators/imageValidator.js';
// import { writeFile } from 'fs/promises';
import httpStatusCodes from "../../utils/statusCodes.js";

// ******************* Variable Path Name Start *******************

const uploadPath = 'public';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// ******************* Variable Path Name End *********************

export const tryCatch = (fn) => {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.log(error);
      return sendErrorResponse(res);
    }
  }

}

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

export const sendResponseBadReq = (res, msg) => {
  return res.status(httpStatusCodes.BAD_REQUEST).json({
    status: false,
    msg: msg ?? ""
  });
};

export const sendResponseOk = (res, msg, data) => {
  if (data) {
    return res.status(httpStatusCodes.OK).json({
      status: true,
      msg: msg ?? "",
      data: data || null
    });
  }
  return res.status(httpStatusCodes.OK).json({
    status: true,
    msg: msg ?? ""
  });
};

export const sendResponseCreated = (res, msg, data) => {
  if (data) {
    return res.status(httpStatusCodes.CREATED).json({
      status: true,
      msg: msg ?? "",
      data: data || null
    });
  }
  return res.status(httpStatusCodes.CREATED).json({
    status: true,
    msg: msg ?? ""
  });
};

export const sendErrorResponse = (res) => {
  return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ status: false, msg: 'Server down, try again in sometime or report the issue!' });
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

export const removeSpace = (str, joinElement = '_') => str.replaceAll(/\s+/g, joinElement);

// export const fileUplaod = async (files, uploaderId = '') => {
//   try {
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath);
//     }

//     const currentTimeStamp = Date.now();
//     let response = {
//       status: false,
//       data: {},
//       message: 'Fail to upload!',
//     };
//     let fileArr = [];

//     let index = 0;
//     for (const file of files) {
//       let filename = `${currentTimeStamp}${index}_${removeSpace(file.name)}`;
//       let fullFileName = join(uploadPath, filename);
//       let isImageValid = await imageValiation(file);

//       if (isImageValid.status) {
//         fileArr.push({ name: fullFileName, file: isImageValid.file });
//       } else {
//         response.message = isImageValid.message;
//         return response;
//       }
//       index++;
//     }

//     for (const x of fileArr) {
//       const imageDataBuffer = Buffer.from(x.file.data);
//       await writeFile(x.name, imageDataBuffer);
//       // await x.file.mv(x.name);
//     }

//     let urlArr = fileArr.map((item) => {
//       return item.name;
//     });

//     let saveFile = await File.create({
//       url: urlArr,
//       createdBy: uploaderId,
//       updatedBy: uploaderId,
//     });

//     if (saveFile) {
//       response.status = true;
//       response.data = saveFile;
//       response.message = 'Image uploaded successfully';
//     } else {
//       response.message = 'Fail to upload image';
//     }

//     return response;
//   } catch (err) {
//     console.error(err);
//     return {
//       status: false,
//       message: 'Fail to upload!',
//     };
//   }
// };

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
