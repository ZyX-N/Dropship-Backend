import express from 'express';
import fileUpload from 'express-fileupload';
import { PORT, APP_ENV } from './config/config.js';
import databaseConnection from './config/database.js'; // Database Connection
import { api } from './src/router/index.js';
import { join } from "path"
import https from 'https';
import http from 'http';
import cors from "cors";

const app = express();
await databaseConnection();

/***************
  MIDDLEWARE 
****************/

app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload());

const __dirname = import.meta.dirname;
console.log(__dirname);
console.log("-------");
console.log(join(__dirname, 'public/img'));
app.use('/image', express.static(join(__dirname, 'public/img')));

app.use('/api', api);

/***************************
   NOT FOUND HANDLER 404
****************************/
app.get('*', (req, res) => {
  res.status(404).send({ status: false, msg: 'Not Found' });
});

app.post('*', (req, res) => {
  res.status(404).send({ status: false, msg: 'Not Found' });
});

/***************************
  APPLICATION  SERVERS 
****************************/

/********************************************
    APPLICATION LISTER HTTP & HTTPS SERVERS
*********************************************/

let serverProtocol = null;

if (APP_ENV === 'production') {
  serverProtocol = https.createServer(credentials, app);
} else if (APP_ENV === 'local') {
  serverProtocol = http.createServer(app);
}

if (!serverProtocol) {
  throw new Error('Environment variables not set!');
}

serverProtocol.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} = ${APP_ENV}`);
});
