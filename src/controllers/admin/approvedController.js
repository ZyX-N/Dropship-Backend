import bcrypt from 'bcrypt';
import {
  getJwtToken,
  sendResponseWithData,
  sendResponseWithoutData,
  sendErrorResponse,
  matchPassword,
  hashPassword,
  generateRandomCouponCode,
  mailCustomerDetailsTemplate,
} from '../../helpers/helper.js';
import { errorLog } from '../../../config/logger.js';
import User from '../../models/User.js';
import UnVerifiedVendor from '../../models/UnVerifiedVendor.js';
import Vendor from '../../models/Vendor.js';
import { MAILER_EMAIL } from '../../../config/config.js';
import { sendMail } from '../../../config/mailer.js';

export const approvedVendorBecomePartner = async (req, res) => {
  try {
    let findVendors = await UnVerifiedVendor.findOne({
      _id: req.body.id,
      isAdminApproved: false,
      isDeleted: false,
      isActive: true,
    }).select('-isDeleted -createdAt -updatedAt -__v');

    if (!findVendors) {
      return sendResponseWithoutData(res, 400, false, 'Vendor not found!');
    }

    let password = generateRandomCouponCode(10);
    findVendors.password = await hashPassword(password);
    const mailOptions = {
      from: MAILER_EMAIL,
      to: findVendors.email,
      subject: 'Gamlewala vendor credentials for logIn',
      html: mailCustomerDetailsTemplate({ name: findVendors.name, email: findVendors.email, password: password }),
    };

    sendMail(mailOptions);

    await UnVerifiedVendor.updateOne({ _id: findVendors._id }, { $set: { isAdminApproved: true } });

    let dataSaved = await User.create({
      name: findVendors.name,
      email: findVendors.email,
      password: findVendors.password,
      mobile: findVendors.mobile,
      type: 'vendor',
      isVerified: true,
    });

    await Vendor.create({
      userId: dataSaved._id,
      name: findVendors.name,
      segment: findVendors.segment,
      pan: findVendors.pan,
      gst: findVendors.gst,
      aadhar: findVendors.aadhar,
    });

    return sendResponseWithoutData(res, 200, true, 'Vendor approved by admin!');
  } catch (error) {
    errorLog(error);
    sendErrorResponse(res);
  }
};
