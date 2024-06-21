import { Router } from "express";
import expressGroupRoutes from 'express-group-routes';

export const customerRoute = Router();
export const customerAuthRoute = Router();

customerRoute.group("/auth", (customerRoute) => {
    customerRoute.get("/", (req, res) => res.status(200).json({ status: "ok", side: "customer" }))
});