import { Router } from 'express';
import expressGroupRoutes from 'express-group-routes';
import bodyValidation from '../validator/bodyValidator.js';
import { signin, signup } from '../controllers/customer/authController.js';
import { body } from 'express-validator';
import { categoryDetails, categoryList } from '../controllers/customer/categoryController.js';
import { settingList } from '../controllers/customer/settingController.js';
import { productDetails, productList, productListByCategory } from '../controllers/customer/productController.js';
import { getCart, productToCart } from '../controllers/customer/cartController.js';
import { cityByStateList, createAddress, deleteAddress, detailsAddress, listAddress, pincodeByCityList, stateList, updateAddress } from '../controllers/customer/addressController.js';
import { orderPlace } from '../controllers/customer/orderController.js';

export const customerRoute = Router();
export const customerAuthRoute = Router();

customerRoute.group('/auth', (customerRoute) => {
  customerRoute.post(
    '/sign-up',
    [
      body('name').notEmpty().withMessage('name field value is empty'),
      body('email').notEmpty().withMessage('email field value is empty').isEmail().withMessage('Invalid email'),
      body('mobile')
        .notEmpty()
        .withMessage('mobile field value is empty')
        .isLength({ min: 10, max: 10 })
        .withMessage('mobile field value should be exact 10 characters'),
      body('password').notEmpty().withMessage('password field value is empty'),
    ],
    bodyValidation,
    signup,
  );

  customerRoute.post(
    '/sign-in',
    [
      body('username').notEmpty().withMessage('username field value is mandatory'),
      body('password').notEmpty().withMessage('password field value is mandatory'),
    ],
    bodyValidation,
    signin,
  );
});

customerRoute.group('/settings', (customerRoute) => {
  customerRoute.get('/', settingList);
});

customerRoute.group('/category', (customerRoute) => {
  customerRoute.get('/', categoryList);
  customerRoute.get('/:slug', categoryDetails);
});

customerRoute.group('/product', (customerRoute) => {
  customerRoute.get('/', productList);
  customerRoute.get('/by-category/:categorySlug', productListByCategory);
  customerRoute.get('/:slug', productDetails);
});

customerRoute.group('/location', (customerRoute) => {
  customerRoute.get('/state', stateList);
  customerRoute.get('/city-by-state/:stateId', cityByStateList);
  customerRoute.get('/pincode-by-city/:cityId', pincodeByCityList);
});

customerAuthRoute.group('/address', (customerAuthRoute) => {
  customerAuthRoute.post(
    '/',
    [
      body('state').notEmpty().withMessage('state field value is mandatory'),
      body('city').notEmpty().withMessage('city field value is mandatory'),
      body('pincode').notEmpty().withMessage('pincode field value is mandatory'),
      body('area').optional(),
      body('street').optional()
    ],
    bodyValidation, createAddress,
  );

  customerAuthRoute.get('/', listAddress);
  customerAuthRoute.get('/:id', detailsAddress);
  customerAuthRoute.delete('/:id', deleteAddress);
  customerAuthRoute.put('/:id', [
    body('state').notEmpty().withMessage('state field value is mandatory'),
    body('city').notEmpty().withMessage('city field value is mandatory'),
    body('pincode').notEmpty().withMessage('pincode field value is mandatory'),
    body('area').optional(),
    body('street').optional()
  ],
    bodyValidation, updateAddress);
});

customerAuthRoute.group('/cart', (customerAuthRoute) => {
  customerAuthRoute.get('/', getCart);
  customerAuthRoute.post(
    '/',
    [
      body('product').notEmpty().withMessage('product field value is mandatory'),
      body('quantity')
        .notEmpty()
        .withMessage('quantity field value is mandatory')
        .isInt({ min: 0, max: 50 })
        .withMessage('quantity can be range from 0 upto 50'),
    ],
    bodyValidation,
    productToCart,
  );
});

customerAuthRoute.group('/order', (customerAuthRoute) => {
  customerAuthRoute.post(
    '/place',
    [
      body('type').notEmpty().withMessage('type field value is mandatory').isIn(["product","cart"]).withMessage("Invalid value in type"),
      body('product').optional(),
      body('quantity').optional().isInt({ min: 1, max: 50 }).withMessage('quantity should be minimum 1 or maximum 50'),
    ],
    bodyValidation,
    orderPlace,
  );
});
