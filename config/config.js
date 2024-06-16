import 'dotenv/config';

/***************************
    SERVER PORT CONFIGRATIONS
***************************/

export const APP_ENV = process.env.hasOwnProperty('APP_ENV') ? process.env.APP_ENV : 'local';
export const PORT = process.env.hasOwnProperty('PORT') ? process.env.PORT : '5000';
export const JWT_SECRET_TOKEN = process.env.hasOwnProperty('JWT_SECRET_TOKEN')
  ? process.env.JWT_SECRET_TOKEN
  : '32c103437dbee3dae37dcbe8cd459226fc47bbd9942e335c088a9ecbf908fe8fa7f828e4c8c354e1bf07f3ac2c084610b3e83d18a91b65e390ee83231312eefb';
// export const JWT_EXPIRES_IN = process.env.hasOwnProperty('JWT_EXPIRES_IN') ? process.env.JWT_EXPIRES_IN : '24h';
export const JWT_EXPIRES_IN = '30d';

/***************************
    DATABASE CONFIGRATIONS
***************************/

export const DB_HOST = process.env.hasOwnProperty('DB_HOST') ? process.env.DB_HOST : '127.0.0.1';
export const DB_PORT = process.env.hasOwnProperty('DB_PORT') ? process.env.DB_PORT : '27017';
export const DB_NAME = process.env.hasOwnProperty('DB_NAME') ? process.env.DB_NAME : 'zixen';
export const SEEDER_PASSWORD = process.env.hasOwnProperty('SEEDER_KEY') ? process.env.SEEDER_KEY : '5000';

/***************************
    MAILER CONFIGRATIONS
***************************/
export const MAILER_EMAIL = process.env.hasOwnProperty('MAILER_EMAIL') ? process.env.MAILER_EMAIL : '';
export const MAILER_PASSWORD = process.env.hasOwnProperty('MAILER_PASSWORD') ? process.env.MAILER_PASSWORD : '';

/***************************
    ORDER CONFIGRATIONS
***************************/
export const FIRST_ORDER_ID_PREFIX = process.env.hasOwnProperty('FIRST_ORDER_ID_PREFIX')
  ? process.env.FIRST_ORDER_ID_PREFIX
  : 'ORDER';

export const FIRST_ORDER_ID_POSTFIX = process.env.hasOwnProperty('FIRST_ORDER_ID_POSTFIX')
  ? process.env.FIRST_ORDER_ID_POSTFIX
  : '00001';

export const FIRST_INVOICE_ID_PREFIX = process.env.hasOwnProperty('FIRST_INVOICE_ID_PREFIX')
  ? process.env.FIRST_INVOICE_ID_PREFIX
  : 'ZIXEN';

export const FIRST_INVOICE_ID_POSTFIX = process.env.hasOwnProperty('FIRST_INVOICE_ID_POSTFIX')
  ? process.env.FIRST_INVOICE_ID_POSTFIX
  : '00001';

/***********************************
    PAYMENY GATEWAY CONFIGRATIONS
***********************************/

export const RAZORPAY_KEY_ID = process.env.hasOwnProperty('RAZORPAY_KEY_ID') ? process.env.RAZORPAY_KEY_ID : null;

export const RAZORPAY_KEY_SECRET = process.env.hasOwnProperty('RAZORPAY_KEY_SECRET')
  ? process.env.RAZORPAY_KEY_SECRET
  : null;
