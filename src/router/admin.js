import { Router } from 'express';
import expressGroupRoutes from 'express-group-routes';
import { login } from '../controllers/admin/authController.js';
import { body } from 'express-validator';
import {
  createCategory,
  deleteCategory,
  editCategory,
  getCategoryDetails,
  getCategoryList,
  getCategoryListDropDown,
} from '../controllers/admin/categoryController.js';
import bodyValidation from '../validator/bodyValidator.js';
import {
  createProduct,
  deleteProduct,
  editProduct,
  getProductDetails,
  getProductList,
} from '../controllers/admin/productController.js';
import { imageUpload } from '../controllers/admin/uploadsController.js';
import {
  createStaticPage,
  getStaticPageList,
  getStaticPageDetails,
  editStaticPage,
  deleteStaticPage,
} from '../controllers/admin/staticPageController.js';
import { getSettings, insertSettings } from '../controllers/admin/settingController.js';
import {
  createState,
  deleteState,
  editState,
  getStateDetails,
  getStateList,
} from '../controllers/admin/stateController.js';
import { createCity, deleteCity, editCity, getCityDetails, getCityList, getCityListByState } from '../controllers/admin/cityController.js';
import {
  createPincode,
  deletePincode,
  editPincode,
  getPincodeDetails,
  getPincodeList,
} from '../controllers/admin/pincodeController.js';

export const adminRoute = Router();
export const adminAuthRoute = Router();

adminRoute.group('/auth', (adminRoute) => {
  adminRoute.post(
    '/login',
    [
      body('username').notEmpty().withMessage('username field value is mandatory'),
      body('password').notEmpty().withMessage('password field value is mandatory'),
    ],
    bodyValidation,
    login,
  );
});

adminAuthRoute.group('/uploads', (adminAuthRoute) => {
  adminAuthRoute.post('/', imageUpload);
});

adminAuthRoute.group('/category', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/',
    [
      body('title').notEmpty().withMessage('title field value is mandatory'),
      body('slug').optional(),
      body('image').optional(),
    ],
    bodyValidation,
    createCategory,
  );

  adminAuthRoute.put(
    '/:id',
    [
      body('title').notEmpty().withMessage('title field value is mandatory'),
      body('active')
        .notEmpty()
        .withMessage('active field value is mandatory')
        .isBoolean()
        .withMessage('active field value should be boolean type'),
      body('image').optional(),
      body('slug').optional(),
    ],
    bodyValidation,
    editCategory,
  );

  adminAuthRoute.get('/', getCategoryList);
  adminAuthRoute.get('/drop-down-list', getCategoryListDropDown);
  adminAuthRoute.get('/:id', getCategoryDetails);
  adminAuthRoute.delete('/:id', deleteCategory);
});

adminAuthRoute.group('/product', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/',
    [
      body('title').notEmpty().withMessage('title field value is mandatory'),
      body('hindiTitle').optional(),
      body('description').notEmpty().withMessage('description field value is mandatory'),
      body('hindiDescription').optional(),
      body('image')
        .notEmpty()
        .withMessage('image field value is mandatory')
        .isArray()
        .withMessage('image field value should be in array'),
      body('category').notEmpty().withMessage('category field value is mandatory'),
      body('strikePrice').optional().isInt({ min: 0 }).withMessage('strikePrice field value should be greater than 0'),
      body('price')
        .notEmpty()
        .withMessage('price field value is mandatory')
        .isInt({ min: 0 })
        .withMessage('price field value should be greater than 0'),
      body('stock')
        .notEmpty()
        .withMessage('stock field value is mandatory')
        .isInt({ min: 0 })
        .withMessage('stock field value should be greater than 0'),
      body('active')
        .notEmpty()
        .withMessage('active field value is mandatory')
        .isBoolean()
        .withMessage('active field value should be a boolean'),
      body('slug').optional(),
      body('adminRating').optional(),
    ],
    bodyValidation,
    createProduct,
  );

  adminAuthRoute.put(
    '/:id',
    [
      body('title').notEmpty().withMessage('title field value is mandatory'),
      body('hindiTitle').optional(),
      body('description').notEmpty().withMessage('description field value is mandatory'),
      body('hindiDescription').optional(),
      body('image')
        .notEmpty()
        .withMessage('image field value is mandatory')
        .isArray()
        .withMessage('image field value should be in array'),
      body('category').notEmpty().withMessage('category field value is mandatory'),
      body('strikePrice').optional().isInt({ min: 0 }).withMessage('strikePrice field value should be greater than 0'),
      body('price')
        .notEmpty()
        .withMessage('price field value is mandatory')
        .isInt({ min: 0 })
        .withMessage('price field value should be greater than 0'),
      body('stock')
        .notEmpty()
        .withMessage('stock field value is mandatory')
        .isInt({ min: 0 })
        .withMessage('stock field value should be greater than 0'),
      body('active')
        .notEmpty()
        .withMessage('active field value is mandatory')
        .isBoolean()
        .withMessage('active field value should be a boolean'),
      body('slug').optional(),
      body('adminRating').optional(),
      body('generateSlug').optional().isBoolean().withMessage('generateSlug field value should be a boolean'),
    ],
    bodyValidation,
    editProduct,
  );

  adminAuthRoute.get('/', getProductList);
  adminAuthRoute.get('/:id', getProductDetails);
  adminAuthRoute.delete('/:id', deleteProduct);
});

adminAuthRoute.group('/static-page', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/',
    [
      body('title').notEmpty().withMessage('title field value is mandatory'),
      body('slug').optional(),
      body('logo').optional(),
      body('template').notEmpty().withMessage('template field value is mandatory'),
    ],
    bodyValidation,
    createStaticPage,
  );

  adminAuthRoute.put(
    '/:id',
    [
      body('title').notEmpty().withMessage('title field value is mandatory'),
      body('slug').optional(),
      body('logo').optional(),
      body('template').notEmpty().withMessage('template field value is mandatory'),
      body('active')
        .notEmpty()
        .withMessage('active field value is mandatory')
        .isBoolean()
        .withMessage('active field value should be boolean type'),
    ],
    bodyValidation,
    editStaticPage,
  );

  adminAuthRoute.get('/', getStaticPageList);
  adminAuthRoute.get('/:id', getStaticPageDetails);
  adminAuthRoute.delete('/:id', deleteStaticPage);
});

adminAuthRoute.group('/settings', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/',
    [
      body('name').notEmpty().withMessage('name field value is required'),
      body('email')
        .notEmpty()
        .withMessage('email field value is required')
        .isEmail()
        .withMessage('email field value should be an valid mail'),
      body('mobile')
        .notEmpty()
        .withMessage('mobile field value is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('mobile field value should be exactly 10 character'),
      body('logo').notEmpty().withMessage('logo field value is required'),
      body('address').notEmpty().withMessage('address field value is required'),
      body('instagram')
        .notEmpty()
        .withMessage('instagram field value is required')
        .isURL()
        .withMessage('instagram field value should be a valid https url'),
      body('facebook')
        .notEmpty()
        .withMessage('facebook field value is required')
        .isURL()
        .withMessage('facebook field value should be a valid https url'),
      body('twitter')
        .notEmpty()
        .withMessage('twitter field value is required')
        .isURL()
        .withMessage('twitter field value should be a valid https url'),
      body('youtube')
        .notEmpty()
        .withMessage('youtube field value is required')
        .isURL()
        .withMessage('youtube field value should be a valid https url'),
    ],
    bodyValidation,
    insertSettings,
  );

  adminAuthRoute.get('/', getSettings);
});

adminAuthRoute.group('/state', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/',
    [body('name').notEmpty().withMessage('name field value is mandatory')],
    bodyValidation,
    createState,
  );

  adminAuthRoute.put(
    '/:id',
    [body('name').notEmpty().withMessage('name field value is mandatory')],
    bodyValidation,
    editState,
  );

  adminAuthRoute.get('/', getStateList);
  adminAuthRoute.get('/:id', getStateDetails);
  adminAuthRoute.delete('/:id', deleteState);
});

adminAuthRoute.group('/city', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/',
    [
      body('name').notEmpty().withMessage('Name field value is mandatory'),
      body('state').isMongoId().withMessage('Valid state ID is mandatory'),
    ],
    bodyValidation,
    createCity,
  );

  adminAuthRoute.put(
    '/:id',
    [
      body('name').notEmpty().withMessage('Name field value is mandatory'),
      body('state').isMongoId().withMessage('Valid state ID is mandatory'),
    ],
    bodyValidation,
    editCity,
  );

  adminAuthRoute.get('/', getCityList);
  adminAuthRoute.get('/by-state/:id', getCityListByState);
  adminAuthRoute.get('/:id', getCityDetails);
  adminAuthRoute.delete('/:id', deleteCity);
});

adminAuthRoute.group('/pincode', (adminAuthRoute) => {
  adminAuthRoute.post(
    '/',
    [
      body('code').notEmpty().withMessage('Pincode field value is mandatory'),
      body('city').isMongoId().withMessage('Valid city ID is mandatory'),
      body('state').isMongoId().withMessage('Valid state ID is mandatory'),
    ],
    bodyValidation,
    createPincode,
  );

  adminAuthRoute.put(
    '/:id',
    [
      body('code').notEmpty().withMessage('Pincode field value is mandatory'),
      body('city').isMongoId().withMessage('Valid city ID is mandatory'),
      body('state').isMongoId().withMessage('Valid state ID is mandatory'),
    ],
    bodyValidation,
    editPincode,
  );

  adminAuthRoute.get('/', getPincodeList);
  adminAuthRoute.get('/:id', getPincodeDetails);
  adminAuthRoute.delete('/:id', deletePincode);
});
