import { Router } from "express";
import expressGroupRoutes from 'express-group-routes';
import { login } from "../controllers/admin/authController.js";
import { body } from "express-validator";
import { createCategory, deleteCategory, editCategory, getCategoryDetails, getCategoryList } from "../controllers/admin/customerController.js";
import bodyValidation from "../validator/bodyValidator.js";

export const adminRoute = Router();
export const adminAuthRoute = Router();

adminRoute.group("/auth", (adminRoute) => {
    adminRoute.post("/login", [
        body('username').notEmpty().withMessage('username field value is mandatory'),
        body('password').notEmpty().withMessage('password field value is mandatory'),
    ], bodyValidation, login)
});

adminRoute.group("/category", (adminRoute) => {
    adminRoute.post("/",
        [
            body('title').notEmpty().withMessage('title field value is mandatory'),
            body('slug').optional(),
        ], bodyValidation,
        createCategory)

    adminRoute.put("/:id",
        [
            body('title').notEmpty().withMessage('title field value is mandatory'),
            body('active').notEmpty().withMessage('active field value is mandatory').isBoolean().withMessage('active field value should be boolean type'),
            body('slug').optional(),
        ], bodyValidation,
        editCategory)

    adminRoute.get("/", getCategoryList)
    adminRoute.get("/:id", getCategoryDetails)
    adminRoute.delete("/:id", deleteCategory)
});