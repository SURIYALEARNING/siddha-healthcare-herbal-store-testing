import initialUsers from './users.js';
import initialProducts from './products.js';
import initialOrders from './orders.js';
import initialBlogs from './blogs.js';
import initialCoupons from './coupons.js';
import initialConsultations from './consultations.js';

const state = {
  users: [...initialUsers],
  products: [...initialProducts],
  orders: [...initialOrders],
  blogs: [...initialBlogs],
  coupons: [...initialCoupons],
  consultations: [...initialConsultations],
};

export default state;
