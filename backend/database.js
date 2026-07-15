// db.js
import mongoose from 'mongoose';
import 'dotenv/config';
const connectDB = async () => {
  try {
    // Replace with your actual URI string or use process.env.MONGO_URI
    const conn = await mongoose.connect(process.env.DATABASE_URL); 
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
