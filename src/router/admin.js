import { Router } from "express";
import expressGroupRoutes from 'express-group-routes';
import { login } from "../controllers/admin/authController.js";
import { body } from "express-validator";
import { createCategory } from "../controllers/admin/customerController.js";
import bodyValidation from "../validator/bodyValidator.js";

export const adminRoute = Router();
export const adminAuthRoute = Router();

adminRoute.group("/auth", (adminRoute) => {
    adminRoute.post("/login", [
        body('username').notEmpty().withMessage('username field value is mandatory'),
        body('password').notEmpty().withMessage('password field value is mandatory'),
    ], bodyValidation,login)
});

adminRoute.group("/category", (adminRoute) => {
    adminRoute.post("/",
        [
            body('title').notEmpty().withMessage('title field value is mandatory'),
            body('slug').optional(),
        ],
        createCategory)
});