import express from 'express';
import cors from 'cors';
import { adminAuthRoute, adminRoute } from './admin.js';
import { adminAuthentication } from '../middlewares/adminAuthentication.js';
import { webAuthRoute, webRoute } from './web.js';
import { commonRoute } from './common.js';
import { webAuthentication } from '../middlewares/webAuthentication.js';

export const api = express.Router();

/***************
  MIDDLEWARE 
****************/
api.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

/****************************
    UNAUTHENTICATED ROUTES
****************************/

api.use('/admin', adminRoute);
api.use('/web', webRoute);
api.use('/common', commonRoute);

/****************************
    AUTHENTICATED ROUTES
****************************/

api.use('/admin', adminAuthentication, adminAuthRoute);
api.use('/web', webAuthentication, webAuthRoute);
