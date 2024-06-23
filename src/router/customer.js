import { Router } from "express";
import expressGroupRoutes from 'express-group-routes';
import { signin, signup } from "../controllers/customer/authController.js";
import { body } from "express-validator";
import { categoryList } from "../controllers/customer/categoryController.js";
import { settingList } from "../controllers/customer/settingController.js";

export const customerRoute = Router();
export const customerAuthRoute = Router();

customerRoute.group("/auth", (customerRoute) => {
    customerRoute.post("/sign-up", [
        body('name').notEmpty().withMessage('name field value is empty'),
        body('email').notEmpty().withMessage('email field value is empty').isEmail().withMessage('Invalid email'),
        body('mobile').notEmpty().withMessage('mobile field value is empty').isLength({ min: 10, max: 10 }).withMessage('mobile field value should be exact 10 characters'),
        body('password').notEmpty().withMessage('password field value is empty'),
    ], signup);

    customerRoute.post("/sign-in", [
        body('username').notEmpty().withMessage('username field value is mandatory'),
        body('password').notEmpty().withMessage('password field value is mandatory'),
    ], signin);
});

customerRoute.group("/settings", (customerRoute) => {
    customerRoute.get("/", settingList);
});

customerRoute.group("/category", (customerRoute) => {
    customerRoute.get("/", categoryList);
});