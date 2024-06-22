import readline from 'readline';
import mongoose from 'mongoose';
import { readFile } from 'fs/promises';
import { createRoles } from './function/role.js';
import { DB_HOST, DB_NAME, DB_PORT, SEEDER_PASSWORD } from '../config/config.js';
import { createUser } from './function/user.js';
import { createCategory } from './function/category.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const connectToDatabase = async () => {
  try {
    await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    console.log('Database Connected Successfully!');
    performSeeding();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

const performSeeding = () => {
  rl.question('Enter the seeding key : ', async (key) => {
    rl.close();
    if (key === SEEDER_PASSWORD) {
      // if (true) {
      try {
        if (mongoose.connection.readyState !== 1) {
          console.error('MongoDB connection not ready. Seeding aborted.');
          process.exit(1);
        }

        let generalData = await readFile('seed/data/general.json', 'utf-8');

        if (generalData) {
          generalData = JSON.parse(generalData);
          await createRoles(generalData.role);
          await createUser(generalData.user)
          await createCategory(generalData.category)
        }

        mongoose.connection.close();
        console.log('Database Disconnected.');
        process.exit(1);
      } catch (error) {
        console.error('Error during seeding operations:', error);
        process.exit(1);
      }
    } else {
      console.error('Invalid key. Seeding aborted.');
      process.exit(1);
    }
  });
};

connectToDatabase();