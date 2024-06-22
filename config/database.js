import mongoose from 'mongoose';
import { DB_HOST, DB_PORT, DB_NAME } from './config.js';

const databaseConnection = async () => {
  try {
    const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("📊 Database Connected Successfully! 🚀 \n******************************************");
  } catch (error) {
    console.error('❌ Error Connecting To The Database:', error)
  }
}
export default databaseConnection;
