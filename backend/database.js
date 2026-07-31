// db.js
import mongoose from 'mongoose';
import 'dotenv/config';

mongoose.plugin((schema) => {
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });
});

const connectDB = async () => {
  try {
    // Replace with your actual URI string or use process.env.MONGO_URI
    const conn = await mongoose.connect(process.env.MONGODB_ATLES);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
