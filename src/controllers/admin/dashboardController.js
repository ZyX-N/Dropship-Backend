import { errorLog } from '../../../config/logger.js';
import { sendResponseWithData, sendResponseWithoutData, sendErrorResponse } from '../../helpers/helper.js';
import User from '../../models/User.js';

import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import VendorProduct from '../../models/VendorProduct.js';

export const dashboardDetails = async (req, res) => {
  try {
    let filter = { isDeleted: false, type: 'customer' };

    let getUsers = await User.find(filter);

    let getOrders = await Order.find({ status: 'confirmed' });

    let totalAmount = getOrders.reduce((acc, order) => acc + order.amountToPay, 0);

    let data = {
      totalUsers: getUsers.length,
      totalOrders: getOrders.length,
      totalAmount,
    };

    if (data) {
      return sendResponseWithData(res, 200, true, 'List fetched Successfully!', data);
    } else {
      return sendResponseWithoutData(res, 400, false, 'No data available!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};
export const getRecentAddProductLists = async (req, res) => {
  try {
    let filter = { isDeleted: false, isActive: true };

    let data = await Product.find(filter)
      .sort({ createdAt: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    if (data) {
      return sendResponseWithData(res, 200, true, 'List fetched Successfully!', data);
    } else {
      return sendResponseWithoutData(res, 200, false, 'No data available!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

export const getTopSellingProductLists = async (req, res) => {
  try {
    let filter = { isDeleted: false, isActive: true };

    let data = await VendorProduct.find(filter)
      .sort({ sales: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    let updatedData = data.map((product) => {
      let totalRevenue = product.vendorPrice * product.sales;
      return {
        ...product._doc,
        totalRevenue,
      };
    });

    if (updatedData.length > 0) {
      return sendResponseWithData(res, 200, true, 'List fetched Successfully!', updatedData);
    } else {
      return sendResponseWithoutData(res, 200, false, 'No data available!');
    }
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};

// export const getTopSellerLists = async (req, res) => {
//   try {
//     let filter = { isDeleted: false, isActive: true };

//     let products = await VendorProduct.find(filter)
//       .sort({ sales: -1 })
//       .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v')
//       .populate({ path: 'vendor', select: 'name' });

//     let vendorSales = {};

//     products.forEach((product) => {
//       let { vendor, sales, vendorPrice, name } = product;

//       if (sales > 0) {
//         if (!vendorSales[vendor.name]) {
//           vendorSales[vendor.name] = {
//             totalSales: 0,
//             totalRevenue: 0,
//             products: [],
//           };
//         }

//         let productRevenue = sales * vendorPrice;
//         vendorSales[vendor.name].totalSales += sales;
//         vendorSales[vendor.name].totalRevenue += productRevenue;
//         vendorSales[vendor.name].products.push({
//           name,
//           vendorPrice,
//           sales,
//           productRevenue,
//         });
//       }
//     });

//     let vendorSalesArray = Object.keys(vendorSales).map((vendorName) => ({
//       vendorName,
//       totalSales: vendorSales[vendorName].totalSales,
//       totalRevenue: vendorSales[vendorName].totalRevenue,
//       products: vendorSales[vendorName].products,
//     }));

//     vendorSalesArray.sort((a, b) => b.totalSales - a.totalSales);

//     let topSellingVendor = vendorSalesArray[0];

//     // const totalSalesAllProducts = vendorSalesArray.reduce((acc, vendor) => acc + vendor.totalSales, 0);

//     if (topSellingVendor) {
//       return sendResponseWithData(res, 200, true, 'Top Selling Vendor!', topSellingVendor);
//     } else {
//       return sendResponseWithoutData(res, 200, false, 'No data available!');
//     }
//   } catch (error) {
//     errorLog(error);
//     return sendErrorResponse(res);
//   }
// };

export const dashboardDetailsApis = async (req, res) => {
  try {
    let filter = { isDeleted: false, type: 'customer' };

    let getUsers = await User.find(filter);

    let getOrders = await Order.find();

    let totalAmount = getOrders.reduce((acc, order) => acc + order.amountToPay, 0);

    let data = {
      totalUsers: getUsers.length,
      totalOrders: getOrders.length,
      totalAmount,
    };

    let data2 = await Product.find({ isDeleted: false, isActive: true })
      .sort({ createdAt: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    let data3 = await VendorProduct.find({ isDeleted: false })
      .sort({ sales: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v');

    let updatedData = data3.map((product) => {
      let totalRevenue = product.vendorPrice * product.sales;
      return {
        ...product._doc,
        totalRevenue,
      };
    });

    let products = await VendorProduct.find({ isDeleted: false, isActive: true })
      .sort({ sales: -1 })
      .select('-isActive -isDeleted -createdBy -updatedBy -createdAt -updatedAt -__v')
      .populate({ path: 'vendor', select: 'name' });

    let vendorSales = {};

    products.forEach((product) => {
      let { vendor, sales, vendorPrice, name } = product;

      if (sales > 0) {
        if (!vendorSales[vendor.name]) {
          vendorSales[vendor.name] = {
            totalSales: 0,
            totalRevenue: 0,
            products: [],
          };
        }

        let productRevenue = sales * vendorPrice;
        vendorSales[vendor.name].totalSales += sales;
        vendorSales[vendor.name].totalRevenue += productRevenue;
        vendorSales[vendor.name].products.push({
          name,
          vendorPrice,
          sales,
          productRevenue,
        });
      }
    });

    let vendorSalesArray = Object.keys(vendorSales).map((vendorName) => ({
      vendorName,
      totalSales: vendorSales[vendorName].totalSales,
      totalRevenue: vendorSales[vendorName].totalRevenue,
      products: vendorSales[vendorName].products,
    }));

    vendorSalesArray.sort((a, b) => b.totalSales - a.totalSales);

    let topSellingVendor = vendorSalesArray[0];
    let dataObj = {
      data,
      TopSellerVendorLists: data2,
      TopSellingProductLists: updatedData,
      topSellingVendor,
    };
    if (Object.keys(dataObj).length > 0) {
      return sendResponseWithData(res, 200, true, 'All Details fetched successfully!', dataObj);
    }

    return sendResponseWithoutData(res, 400, false, 'Failed to fetched details!', dataObj);
  } catch (error) {
    errorLog(error);
    return sendErrorResponse(res);
  }
};



