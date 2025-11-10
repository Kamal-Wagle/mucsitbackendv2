import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // <--- load environment variables

const dbUserName = process.env.DB_USER_NAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;


if (!dbUserName || !dbPassword || !dbName || !dbHost) {
  throw new Error("Missing required environment variables for DB connection");
}

const dbURL = `mongodb+srv://${dbUserName}:${encodeURIComponent(dbPassword)}@${dbHost}/${dbName}?retryWrites=true&w=majority`;

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(dbURL);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
