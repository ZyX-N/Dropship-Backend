import mongoose from 'mongoose';
import { DB_HOST, DB_PORT, DB_NAME } from './config.js';

const databaseConnection = () => {
  const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  console.log(url);
  mongoose
    .connect(url)
    .then(() =>
      console.log(`📊 Database Connected Successfully! 🚀
******************************************`),
    )
    .catch((error) => console.error('❌ Error Connecting To The Database:', error));
}
export default databaseConnection;
