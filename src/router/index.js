import { Router } from 'express';
import { adminAuthRoute, adminRoute } from './admin.js';
import { customerAuthRoute, customerRoute } from './customer.js';
import { adminAuthentication } from '../middlewares/admin.js';
import { customerAuthentication, customerTemporaryAuthentication } from '../middlewares/customer.js';

export const api = Router();

// **************************************
// ******** Unauthenticated Route *******
// **************************************
api.use('/admin', adminRoute);
api.use('/customer', customerTemporaryAuthentication, customerRoute);

// **************************************
// ******** Authenticated Route *********
// **************************************
api.use('/admin', adminAuthentication, adminAuthRoute);
api.use('/customer', customerAuthentication, customerAuthRoute);
