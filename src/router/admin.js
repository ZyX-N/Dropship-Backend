import { Router } from "express";
import expressGroupRoutes from 'express-group-routes';
import { login } from "../controllers/admin/authController.js";

export const adminRoute = Router();
export const adminAuthRoute = Router();

adminRoute.group("/auth", (adminRoute) => {
    adminRoute.get("/login", login)
});