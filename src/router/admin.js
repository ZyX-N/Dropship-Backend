import { Router } from "express";
import expressGroupRoutes from 'express-group-routes';
import { login } from "../controllers/admin/authController.js";
import { body } from "express-validator";
import { createCategory, deleteCategory, editCategory, getCategoryDetails, getCategoryList } from "../controllers/admin/categoryController.js";
import bodyValidation from "../validator/bodyValidator.js";
import { createProduct, getProductList } from "../controllers/admin/productController.js";

export const adminRoute = Router();
export const adminAuthRoute = Router();

adminRoute.group("/auth", (adminRoute) => {
    adminRoute.post("/login", [
        body('username').notEmpty().withMessage('username field value is mandatory'),
        body('password').notEmpty().withMessage('password field value is mandatory'),
    ], bodyValidation, login)
});

adminAuthRoute.group("/category", (adminAuthRoute) => {
    adminAuthRoute.post("/",
        [
            body('title').notEmpty().withMessage('title field value is mandatory'),
            body('slug').optional(),
        ],
        bodyValidation,
        createCategory)

    adminAuthRoute.put("/:id",
        [
            body('title').notEmpty().withMessage('title field value is mandatory'),
            body('active').notEmpty().withMessage('active field value is mandatory').isBoolean().withMessage('active field value should be boolean type'),
            body('slug').optional(),
        ],
        bodyValidation,
        editCategory)

    adminAuthRoute.get("/", getCategoryList)
    adminAuthRoute.get("/:id", getCategoryDetails)
    adminAuthRoute.delete("/:id", deleteCategory)
});

adminAuthRoute.group("/product", (adminAuthRoute) => {
    adminAuthRoute.post("/",
        [
            body('title').notEmpty().withMessage('title field value is mandatory'),
            body('hindiTitle').optional(),
            body('description').notEmpty().withMessage('description field value is mandatory'),
            body('hindiDescription').optional(),
            body('image').notEmpty().withMessage('image field value is mandatory').isArray().withMessage('image field value should be in array'),
            body('category').notEmpty().withMessage('category field value is mandatory'),
            body('strikePrice').optional().isInt({ min: 0 }).withMessage('strikePrice field value should be greater than 0'),
            body('price').notEmpty().withMessage('price field value is mandatory').isInt({ min: 0 }).withMessage('price field value should be greater than 0'),
            body('stock').notEmpty().withMessage('stock field value is mandatory').isInt({ min: 0 }).withMessage('stock field value should be greater than 0'),
        ],
        bodyValidation,
        createProduct
    );

    // adminAuthRoute.put("/:id",
    //     [
    //         body('title').notEmpty().withMessage('title field value is mandatory'),
    //         body('active').notEmpty().withMessage('active field value is mandatory').isBoolean().withMessage('active field value should be boolean type'),
    //         body('slug').optional(),
    //     ],
    //     bodyValidation,
    //     editCategory)

    adminAuthRoute.get("/", getProductList)
    // adminAuthRoute.get("/:id", getCategoryDetails)
    // adminAuthRoute.delete("/:id", deleteCategory)
});