import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { User } from './models/User.js';

try {
  await mongoose.connect(process.env.MONGODB_ATLES);
  console.log('DB connected');

  const existing = await User.findOne({ email: 'admin@siddha.com' });
  if (existing) {
    console.log('SUPER_ADMIN already exists:', existing.email, 'role:', existing.role, 'isActive:', existing.isActive);
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Admin@123', salt);
    await User.create({
      fullName: 'Super Admin',
      email: 'admin@siddha.com',
      mobileNumber: '9876543210',
      password: hashed,
      isAdmin: true,
      role: 'SUPER_ADMIN',
      isActive: true,
      permissions: {
        dashboard: true, products: true, categories: true, orders: true,
        customers: true, batches: true, reminders: true, reviews: true,
        coupons: true, carousel: true, consultations: true, shipping: true,
        staffManagement: true,
      },
    });
    console.log('SUPER_ADMIN created: admin@siddha.com / Admin@123');
  }
} catch (e) {
  console.error('Error:', e.message);
} finally {
  await mongoose.disconnect();
}
