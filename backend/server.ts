import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import connectDB from './database.js';
import productRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import checkout from './routes/orders.js'
import passport from "./config/passport.js";
import cors from "cors";



connectDB();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
console.log(PORT);
app.use(passport.initialize());
app.use(express.json());


// In-Memory Databases (Seeded)
let users = [
  {
    id: "user-1",
    fullName: "Siddha Admin",
    email: "admin@siddha.com",
    password: "Password123",
    mobileNumber: "9876543210",
    isAdmin: true,
    address: {
      address: "12, Traditional Herb Street",
      state: "Tamil Nadu",
      district: "Chennai",
      pincode: "600001",
    },
  },
  {
    id: "user-2",
    fullName: "Ramanathan Sundaram",
    email: "ram@example.com",
    password: "User123!",
    mobileNumber: "9123456780",
    isAdmin: false,
    address: {
      address: "45, Green Valley Colony, Peelamedu",
      state: "Tamil Nadu",
      district: "Coimbatore",
      pincode: "641004",
    },
  },
];

let products = [
  {
    id: "prod-1",
    name: "Premium Kabasura Kudineer Coarse Powder",
    price: 180,
    discountPrice: 145,
    stock: 25,
    category: "Immunity Boosters",
    description: "Kabasura Kudineer is a traditional Siddha formulation containing 15 powerful herbal ingredients. It is widely used to bolster respiratory health, manage fevers, and boost overall immune defenses naturally.",
    ingredients: [
      "Chukku (Dry Ginger)",
      "Thippili (Long Pepper)",
      "Ilavangam (Clove)",
      "Sirukanchori Ver (Tragia involucrata root)",
      "Kandankathiri (Yellow-fruit nightshade)",
      "Koraikizhangu (Cyperus rotundus)",
      "Nilavembu (Andrographis paniculata)"
    ],
    benefits: [
      "Strong traditional immune support",
      "Excellent defense for respiratory discomfort",
      "Helps clear nasal and chest congestion",
      "Reduces seasonal fatigue and low-grade body aches"
    ],
    usageInstructions: [
      "Take 5g of Kabasura Kudineer powder.",
      "Add 240ml of water and boil until reduced to 60ml (one-fourth).",
      "Filter the decoction and consume warm.",
      "Drink twice daily before meal times, or as advised by a Siddha physician."
    ],
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.8,
    reviews: [
      { id: "rev-1", user: "Ganesh K.", rating: 5, comment: "Authentic taste and highly effective during monsoon flu seasons.", date: "2026-05-15" },
      { id: "rev-2", user: "Meenakshi S.", rating: 4, comment: "Very good quality powder, very clean. Highly recommended.", date: "2026-06-01" }
    ]
  },
  {
    id: "prod-2",
    name: "Amukkara Chooranam Tablets (Siddha Ashwagandha)",
    price: 250,
    discountPrice: 195,
    stock: 40,
    category: "Immunity Boosters",
    description: "Amukkara (Winter Cherry/Ashwagandha) is one of the most celebrated rejuvenating rejuvenator (Karpam) herbs in Siddha medicine. Formulated to enhance vitality, combat daily stress, strengthen nervous response, and improve deep sleep quality.",
    ingredients: [
      "Amukkara Kizhanagu (Withania somnifera root)",
      "Karam (Piper longum)",
      "Chukku (Zingiber officinale)",
      "Elakkai (Elettaria cardamomum)",
      "Sugar (Saccharum officinarum)"
    ],
    benefits: [
      "Combats nervous debility and physical fatigue",
      "Aids stress management by regulating cortisol levels",
      "Promotes restful and synchronized sleep patterns",
      "Supports muscle strength and bone density"
    ],
    usageInstructions: [
      "Take 1 to 2 tablets twice daily.",
      "Preferably swallow with warm milk or honey after food consumption.",
      "Suitable for chronic fatigue conditions."
    ],
    images: [
      "https://images.unsplash.com/photo-1611070973770-b1a629af7d12?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.6,
    reviews: [
      { id: "rev-3", user: "Anand R.", rating: 5, comment: "Helped immensely with my work fatigue and severe insomnia.", date: "2026-04-10" }
    ]
  },
  {
    id: "prod-3",
    name: "Traditional Inji Chooranam Digestive Powder",
    price: 150,
    discountPrice: 120,
    stock: 15,
    category: "消化/Digestive Care",
    description: "Pure Siddha formula leveraging dry ginger (Inji) balanced with medicinal herbs, traditionally indicated for indigestion, bloating, loss of appetite, and morning sickness.",
    ingredients: [
      "Inji (Zingiber officinale dry skin-removed)",
      "Milagu (Black Pepper)",
      "Thippili (Long pepper)",
      "Seeragam (Cumin seeds)",
      "Indhuppu (Rock salt)"
    ],
    benefits: [
      "Stimulates active gastric enzymes for ease of digestion",
      "Relieves abdominal gas, flatulence, and uncomfortable bloating",
      "Combats mild nausea and motion sickness",
      "Cleanses toxic metabolic waste (Amam)"
    ],
    usageInstructions: [
      "Mix 1-2 grams of powder in warm water or ghee.",
      "Consume immediately after meals for heavy digestion.",
      "Adults: Twice daily. Children: Half the dosage."
    ],
    images: [
      "https://images.unsplash.com/photo-1599639085605-a34414b6d32c?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.5,
    reviews: [
      { id: "rev-4", user: "Selvam P.", rating: 4, comment: "Instant relief from heavy meal bloating.", date: "2026-05-20" }
    ]
  },
  {
    id: "prod-4",
    name: "Golden Glow Nalangu Maavu Herbal Bath Powder",
    price: 220,
    discountPrice: 185,
    stock: 32,
    category: "Skin Care",
    description: "An absolute organic Siddha skincare bathing secret. Contains a custom formulation of wild turmeric, sandalwood, and pulse flours that naturally cleanse, exfoliate, and protect the skin from modern environmental impurities.",
    ingredients: [
      "Kasthuri Manjal (Wild Turmeric)",
      "Poosanthu (Sandalwood powder)",
      "Vetiver (Khus khus root)",
      "Koraikizhangu (Nutgrass)",
      "Rose petals",
      "Green Gram Flour"
    ],
    benefits: [
      "Cleanses skin pores without stripping natural nourishing oils",
      "Prevents skin rashes, localized body acne, and bad sweat odor",
      "Gives a beautiful Golden Glow and natural herbal fragrance",
      "Reduces blemishes and pigmentation patches"
    ],
    usageInstructions: [
      "Mix 2 tablespoons of Nalangu Maavu with water or milk to form a paste.",
      "Apply evenly across the face and body.",
      "Gently scrub in circular motions and wash off. Use daily instead of chemical soaps."
    ],
    images: [
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.9,
    reviews: [
      { id: "rev-5", user: "Janani R.", rating: 5, comment: "I stopped using chemical face washes after trying this! Beautiful scent.", date: "2026-06-11" }
    ]
  },
  {
    id: "prod-5",
    name: "Bhringraj & Vetiver Cooling Herbal Hair Oil",
    price: 320,
    discountPrice: 275,
    stock: 20,
    category: "Hair Care",
    description: "Infused with organically sourced Bhringraj (Karisalankanni) and whole Vetiver roots floating in pure cold-pressed coconut oil. It acts as an deep moisturizer, arresting hair fall, promoting scalp circulation, and keeping the head cool.",
    ingredients: [
      "Karisalankanni (Eclipta prostrata juice)",
      "Vetiver (Chrysopogon zizanioides whole root)",
      "Nellikkai (Amla)",
      "Ponnanganni (Sessile joyweed)",
      "Cold-pressed Coconut Oil",
      "Castor Oil"
    ],
    benefits: [
      "Nourishes hair roots deeply and promotes denser dark hair growth",
      "Prevents premature graying of hair strands due to heat and pollution",
      "Soothes tension, reducing head-heat and mental strain",
      "Addresses persistent dandruff and itchy scalp micro-issues"
    ],
    usageInstructions: [
      "Apply a generous quantity of oil directly onto the scalp and hair length.",
      "Massage gently using finger pads for 10 minutes in comforting circles.",
      "Leave on for at least an hour or overnight before rinsing with a mild herbal cleanser."
    ],
    images: [
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800"
    ],
    rating: 4.7,
    reviews: [
      { id: "rev-6", user: "Karthik Raja", rating: 4, comment: "My dandruff is almost gone. Sleep has also improved secondary to the cooling effect.", date: "2026-06-15" }
    ]
  }
];

let orders = [
  {
    id: "SID-1092",
    userId: "user-2",
    items: [
      {
        productId: "prod-1",
        name: "Premium Kabasura Kudineer Coarse Powder",
        price: 145,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      },
      {
        productId: "prod-4",
        name: "Golden Glow Nalangu Maavu Herbal Bath Powder",
        price: 185,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800",
      }
    ],
    subtotal: 475,
    couponDiscount: 50,
    total: 425,
    shippingAddress: {
      address: "45, Green Valley Colony, Peelamedu",
      state: "Tamil Nadu",
      district: "Coimbatore",
      pincode: "641004",
    },
    mobileNumber: "9123456780",
    email: "ram@example.com",
    fullName: "Ramanathan Sundaram",
    status: "Shipped",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    date: "2026-06-18T14:32:00.000Z"
  }
];

let blogs = [
  {
    id: "blog-1",
    title: "Understanding Karpam Herbs in Siddha Medicine for Longevity",
    content: "Siddha medicine revolves around the concept of 'Kaya Karpam' — a science of body rejuvenation designed to retard aging, eliminate chronic illness, and promote cellular longevity. Herbs like Amukkara (Ashwagandha), Nelikkai (Amla), and Karisalankanni (Bhringraj) play critical roles as daily Karpam supplements. This post explores how incorporating these traditional foods promotes active immunity and balances the three humors: Vatham, Pitham, and Kabham.",
    category: "Siddha Medicine",
    author: "Dr. S. Thirugnanasambandar, B.S.M.S",
    date: "2026-06-10",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
    reads: 240
  },
  {
    id: "blog-2",
    title: "Siddha Tips for Smooth Digestion and Eliminating Bloating Naturally",
    content: "According to traditional Siddha philosophy, almost all metabolic ailments originate from stagnant digestion or 'Mandham'. Simple spices lying in your home kitchen can restore gastric harmony immediately. Drinking ginger tea with rock salt prior to meals or chewing roasted fennel seeds are time-tested traditions. For chronic flatulence, Inji Chooranam or Eladi Chooranam stimulates normal salivary secretions and eases intestinal blockages.",
    category: "Digestion",
    author: "Dr. V. Rajeshwari, M.D. (Siddha)",
    date: "2026-06-14",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800",
    reads: 185
  },
  {
    id: "blog-3",
    title: "Traditional Nalangu Maavu: Reclaiming Herbal Skincare from Chemicals",
    content: "Modern foaming face washes are often saturated with sulfates and synthetic fragrances that erode natural epidermal barriers. Siddha herbal bath formulations like Nalangu Maavu use Kasthuri Manjal (wild turmeric), sandal, Vetiver, and green mung bean flours. These organic ingredients act as soft exfoliants, absorb extra perspiration oils, block fungal skin eruptions, and deliver an elegant, soft glow that improves with consistent use.",
    category: "Skin Care",
    author: "Dr. S. Thirugnanasambandar, B.S.M.S",
    date: "2026-06-19",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800",
    reads: 154
  }
];

let coupons = [
  { code: "SIDDHA10", discountPercent: 10, expiryDate: "2026-12-31", active: true },
  { code: "HEALTH20", discountPercent: 20, expiryDate: "2026-09-30", active: true },
  { code: "WELCOME50", discountPercent: 15, expiryDate: "2026-12-31", active: true }
];

// Consultation Bookings Storage
let consultations = [
  {
    id: "CON-9812",
    fullName: "Ramanathan Sundaram",
    mobileNumber: "9123456780",
    email: "ram@example.com",
    preferredDate: "2026-06-25",
    preferredTime: "11:00 AM",
    healthIssues: "Looking for traditional remedies to improve digestions and clear sleep apnea fatigue.",
    status: "Confirmed",
    date: "2026-06-20T10:00:00.000Z"
  }
];

// Helper to check user roles (very simple middleware simulation)
export const getLoggedUser = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  console.log("authheader", authHeader);

  if (!authHeader) return null;
  const userId = authHeader.replace("Bearer ", "");
  return users.find(u => u.id === userId) || null;
};

// --- API ENDPOINTS ---

// Check server status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// Auth API
// app.post("/api/auth/register", (req, res) => {
//   const { fullName, email, mobileNumber, password } = req.body;
//   if (!fullName || !email || !mobileNumber || !password) {
//     return res.status(400).json({ error: "All profile fields are required." });
//   }
//   const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
//   if (existingUser) {
//     return res.status(400).json({ error: "Email already registered." });
//   }
//   const newUser = {
//     id: "user-" + (users.length + 1),
//     fullName,
//     email,
//     password,
//     mobileNumber,
//     isAdmin: false,
//     address: undefined,
//   };
//   users.push(newUser);
//   res.status(201).json({
//     message: "Registration successful!",
//     user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email, mobileNumber: newUser.mobileNumber, isAdmin: false }
//   });
// });

app.use("/auth", authRoutes)

app.use("/api/products", productRoutes);

app.use('/api', checkout);



// app.post("/api/auth/login", (req, res) => {
//   const { email, password } = req.body;
//   const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
//   if (!user) {
//     return res.status(401).json({ error: "Invalid email or password credentials." });
//   }
//   res.json({
//     message: "Login successful!",
//     user: { id: user.id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, isAdmin: user.isAdmin, address: user.address }
//   });
// });

app.get("/api/auth/profile", (req, res) => {
  const user = getLoggedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized user." });
  res.json({ user: { id: user.id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, isAdmin: user.isAdmin, address: user.address } });
});

app.put("/api/auth/profile/update", (req, res) => {
  const user = getLoggedUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized user." });
  const { fullName, mobileNumber, address, state, district, pincode } = req.body;

  user.fullName = fullName || user.fullName;
  user.mobileNumber = mobileNumber || user.mobileNumber;

  if (address || state || district || pincode) {
    user.address = {
      address: address || (user.address?.address || ""),
      state: state || (user.address?.state || ""),
      district: district || (user.address?.district || ""),
      pincode: pincode || (user.address?.pincode || ""),
    };
  }
  res.json({ message: "Profile successfully modified!", user: { id: user.id, fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber, isAdmin: user.isAdmin, address: user.address } });
});

// Products API
// app.get("/api/products", (req, res) => {
//   res.json(products);
// });



// app.get("/api/products/:id", (req, res) => {
//   const product = products.find(p => p.id === req.params.id);
//   if (!product) return res.status(404).json({ error: "Product not located." });
//   res.json(product);
// });

// // Admin Product Management
// app.post("/api/products/manage", (req, res) => {
//   const user = getLoggedUser(req);
//   if (!user || !user.isAdmin) return res.status(403).json({ error: "Access forbidden. Admin privilege required." });

//   const { name, price, discountPrice, stock, category, description, ingredients, benefits, usageInstructions, images } = req.body;

//   if (!name || !price || !category || !description) {
//     return res.status(400).json({ error: "Name, price, category and description are required requirements." });
//   }

//   const newProduct = {
//     id: "prod-" + (products.length + 1),
//     name,
//     price: Number(price),
//     discountPrice: discountPrice ? Number(discountPrice) : Number(price),
//     stock: Number(stock) || 10,
//     category,
//     description,
//     ingredients: Array.isArray(ingredients) ? ingredients : [],
//     benefits: Array.isArray(benefits) ? benefits : [],
//     usageInstructions: Array.isArray(usageInstructions) ? usageInstructions : [],
//     images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"],
//     rating: 5.0,
//     reviews: []
//   };

//   products.push(newProduct);
//   res.status(201).json({ message: "Product created successfully!", product: newProduct });
// });

app.put("/api/products/manage/:id", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found." });

  const { name, price, discountPrice, stock, category, description, ingredients, benefits, usageInstructions, images } = req.body;

  product.name = name || product.name;
  product.price = price !== undefined ? Number(price) : product.price;
  product.discountPrice = discountPrice !== undefined ? Number(discountPrice) : product.discountPrice;
  product.stock = stock !== undefined ? Number(stock) : product.stock;
  product.category = category || product.category;
  product.description = description || product.description;
  if (Array.isArray(ingredients)) product.ingredients = ingredients;
  if (Array.isArray(benefits)) product.benefits = benefits;
  if (Array.isArray(usageInstructions)) product.usageInstructions = usageInstructions;
  if (Array.isArray(images)) product.images = images;

  res.json({ message: "Product updated successfully!", product });
});

app.delete("/api/products/manage/:id", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin access demanded." });

  const initialLen = products.length;
  products = products.filter(p => p.id !== req.params.id);

  if (products.length === initialLen) {
    return res.status(404).json({ error: "Product to delete not found." });
  }
  res.json({ message: "Product deleted successfully!" });
});

// Product reviews addition
app.post("/api/products/:id/review", (req, res) => {
  const user = getLoggedUser(req);
  const username = user ? user.fullName : "Guest Buyer";
  const { rating, comment } = req.body;

  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found." });

  const newReview = {
    id: "rev-" + Date.now(),
    user: username,
    rating: Number(rating) || 5,
    comment: comment || "Excellent Siddha healthcare item.",
    date: new Date().toISOString().split("T")[0]
  };

  product.reviews.push(newReview);
  // Re-calculate average rating
  const totalR = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
  product.rating = Number((totalR / product.reviews.length).toFixed(1));

  res.status(201).json({ message: "Review added successfully!", reviews: product.reviews, rating: product.rating });
});

// Orders APIs
// app.get("/api/orders", (req, res) => {
//   const user = getLoggedUser(req);
//   if (!user) return res.status(401).json({ error: "Unauthorized user." });

//   const userOrders = orders.filter(o => o.userId === user.id);
//   res.json(userOrders);
// });


// app.post("/api/orders", (req, res) => {
//   const user = getLoggedUser(req);
//   if (!user) return res.status(401).json({ error: "Register/login to submit orders." });

//   const { items, subtotal, couponDiscount, total, shippingAddress, mobileNumber, email, fullName, paymentMethod } = req.body;

//   if (!items || !items.length || !shippingAddress || !mobileNumber || !fullName || !paymentMethod) {
//     return res.status(400).json({ error: "All checkout details are required." });
//   }

//   // Stock check and decrement
//   for (const item of items) {
//     const prod = products.find(p => p.id === item.productId);
//     if (prod) {
//       if (prod.stock < item.quantity) {
//         return res.status(400).json({ error: `Not enough stock for ${prod.name}. Only ${prod.stock} left.` });
//       }
//       prod.stock -= item.quantity;
//     }
//   }

//   const newOrder = {
//     id: "SID-" + Math.floor(1000 + Math.random() * 9000),
//     userId: user.id,
//     items,
//     subtotal: Number(subtotal),
//     couponDiscount: Number(couponDiscount) || 0,
//     total: Number(total),
//     shippingAddress,
//     mobileNumber,
//     email,
//     fullName,
//     status: "Ordered" as const,
//     paymentMethod,
//     paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" as const : "Paid" as const,
//     date: new Date().toISOString()
//   };

//   orders.push(newOrder);
//   res.status(201).json({ message: "Order placed successfully!", order: newOrder });
// });

// Admin view all orders
app.get("/api/admin/orders", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin authorization restricted." });
  res.json(orders);
});

// Admin update order status
app.put("/api/admin/orders/:id/status", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order details not found." });

  const { status, paymentStatus } = req.body;
  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  res.json({ message: "Order status modified!", order });
});

// Order tracking (public or user-restricted by ID)
app.get("/api/orders/track/:id", (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order with this ID was not retrieved." });
  res.json(order);
});

// Consultation Booking APIs
app.post("/api/consultation", (req, res) => {
  const { fullName, mobileNumber, email, preferredDate, preferredTime, healthIssues } = req.body;
  if (!fullName || !mobileNumber || !preferredDate || !preferredTime) {
    return res.status(400).json({ error: "Full Name, Mobile, Date, and Time range are required." });
  }

  const logUser = getLoggedUser(req);
  const newBooking = {
    id: "CON-" + Math.floor(1000 + Math.random() * 9000),
    fullName,
    mobileNumber,
    email: email || "",
    preferredDate,
    preferredTime,
    healthIssues: healthIssues || "General Siddha Health Consult.",
    status: "Confirmed",
    date: new Date().toISOString()
  };

  consultations.push(newBooking);
  res.status(201).json({ message: "Consultation booked successfully with Chief Siddha Physician! Confirmation SMS/WhatsApp has been queued.", booking: newBooking });
});

app.get("/api/admin/consultations", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin access forbidden." });
  res.json(consultations);
});

// Blogs APIs
app.get("/api/blogs", (req, res) => {
  res.json(blogs);
});

app.post("/api/blogs/manage", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege demanded." });

  const { title, content, category, author, image } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Title, content, and category are required parameters." });
  }

  const newBlog = {
    id: "blog-" + (blogs.length + 1),
    title,
    content,
    category,
    author: author || "Dr. S. Thirugnanasambandar, B.S.M.S",
    date: new Date().toISOString().split("T")[0],
    image: image || "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800",
    reads: 0
  };

  blogs.push(newBlog);
  res.status(201).json({ message: "Blog article published!", blog: newBlog });
});

app.put("/api/blogs/manage/:id", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  const blog = blogs.find(b => b.id === req.params.id);
  if (!blog) return res.status(404).json({ error: "Blog not located." });

  const { title, content, category, author, image } = req.body;
  blog.title = title || blog.title;
  blog.content = content || blog.content;
  blog.category = category || blog.category;
  blog.author = author || blog.author;
  blog.image = image || blog.image;

  res.json({ message: "Blog modified successfully!", blog });
});

app.delete("/api/blogs/manage/:id", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  blogs = blogs.filter(b => b.id !== req.params.id);
  res.json({ message: "Blog removed successfully." });
});

app.post("/api/blogs/:id/increment-reads", (req, res) => {
  const blog = blogs.find(b => b.id === req.params.id);
  if (blog) {
    blog.reads += 1;
    res.json({ reads: blog.reads });
  } else {
    res.status(404).json({ error: "Blog not found." });
  }
});

// Coupons APIs
app.get("/api/coupons", (req, res) => {
  // Available coupons list
  res.json(coupons);
});

app.post("/api/coupons/apply", (req, res) => {
  const { code } = req.body;
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  if (!coupon) {
    return res.status(400).json({ error: "Invalid or expired coupon code." });
  }
  res.json({ message: "Coupon applied successfully!", discountPercent: coupon.discountPercent });
});

app.post("/api/coupons/manage", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin privilege required." });

  const { code, discountPercent, expiryDate } = req.body;
  if (!code || !discountPercent) {
    return res.status(400).json({ error: "Code and discount percent are required details." });
  }

  const existing = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (existing) {
    existing.discountPercent = Number(discountPercent);
    existing.expiryDate = expiryDate || "2026-12-31";
    return res.json({ message: "Coupon successfully modified!", coupon: existing });
  }

  const newCoupon = {
    code: code.toUpperCase(),
    discountPercent: Number(discountPercent),
    expiryDate: expiryDate || "2026-12-31",
    active: true
  };
  coupons.push(newCoupon);
  res.status(201).json({ message: "New coupon coupon created!", coupon: newCoupon });
});

// Admin Customers Management
app.get("/api/admin/users", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Admin access forbidden." });

  // Return non-sensitive details, with order totals if possible
  const customersList = users.map(u => {
    const userOrders = orders.filter(o => o.userId === u.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      mobileNumber: u.mobileNumber,
      isAdmin: u.isAdmin,
      address: u.address,
      orderCount: userOrders.length,
      totalSpent
    };
  });
  res.json(customersList);
});

// Admin Analytics Dashboard Insights
app.get("/api/admin/analytics", (req, res) => {
  const user = getLoggedUser(req);
  if (!user || !user.isAdmin) return res.status(403).json({ error: "Unauthorized access forbidden." });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => !u.isAdmin).length;

  // Derive top products sold
  const productSalesMap: { [key: string]: { name: string, quantity: number, revenue: number } } = {};

  orders.forEach(o => {
    o.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.quantity * item.price;
    });
  });

  const topProducts = Object.keys(productSalesMap).map(id => ({
    id,
    ...productSalesMap[id]
  })).sort((a, b) => b.quantity - a.quantity);

  // Category wise sales analysis
  const categorySales: { [key: string]: number } = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod ? prod.category : "Herbal Care";
      categorySales[cat] = (categorySales[cat] || 0) + (item.quantity * item.price);
    });
  });

  const categoryData = Object.keys(categorySales).map(cat => ({
    name: cat,
    value: categorySales[cat]
  }));

  // Monthly revenue trend (Mock graph with dynamic values)
  const monthlyRevenue = [
    { name: "Jan", revenue: 8500, orders: 40 },
    { name: "Feb", revenue: 12400, orders: 58 },
    { name: "Mar", revenue: 15600, orders: 75 },
    { name: "Apr", revenue: 19800, orders: 90 },
    { name: "May", revenue: 24500, orders: 110 },
    { name: "Jun", revenue: totalRevenue + 15000, orders: totalOrders + 70 }, // dynamic tail
  ];

  res.json({
    totalRevenue,
    totalOrders,
    totalCustomers,
    topProducts: topProducts.slice(0, 5),
    categoryData,
    monthlyRevenue,
    bookingCount: consultations.length
  });
});

// AI Siddha Assistant Chatbot using Google GenAI SDK (Server-Side)
app.post("/api/chatbot", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Query message is required." });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || geminiApiKey === "MY_GEMINI_API_KEY") {
    // If no real API key is inserted, gracefully provide standard helpful mock responses about Siddha and herbs
    console.log("No GEMINI_API_KEY located in environment, utilizing traditional rule-based Siddha therapist backup.");
    const query = message.toLowerCase();
    let responseText = "";

    if (query.includes("immunity") || query.includes("fever") || query.includes("kabasura") || query.includes("covid") || query.includes("cough")) {
      responseText = `**Immunity & Respiratory Health (Kabasura Kudineer & Thuthuvalai Chooranam)**

In Siddha tradition, Kabasura Kudineer is the preeminent formulation to combat respiratory issues and activate vital defenses (Khabam balancing). It consists of 15 divine dry herbs.
- **Remedy**: Boil 5g of Kabasura Kudineer Coarse Powder in 240ml of water until it evaporates to 60ml. Drink warm.
- **Product Suggestion**: You can purchase our *Premium Kabasura Kudineer Coarse Powder* in the store!
- **Siddha Advice**: Please avoid cold-refrigerated drinks, milk-sweets, and sleep early.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
    } else if (query.includes("sleep") || query.includes("insomnia") || query.includes("stress") || query.includes("anxiety") || query.includes("amukkara")) {
      responseText = `**Nervous Calm & Stress Management (Amukkara - Siddha Ashwagandha)**

Amukkara Chooranam is celebrated as a 'Karpam' (rejuvenator) in Siddha. It relaxes deep neurological pathways, balances Vatham (wind energy), and aids muscle growth.
- **Remedy**: Consuming 1-2 tablets of Amukkara with cozy warm milk or pure honey before bedtime restores normal sleep architectures.
- **Product Suggestion**: Search our *Amukkara Chooranam Tablets* for genuine quality.
- **Daily Practice**: Massage soles of feet with warm sesame oil before sleeping.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
    } else if (query.includes("digest") || query.includes("gas") || query.includes("bloat") || query.includes("stomach") || query.includes("constip")) {
      responseText = `**Gastric Integrity & Smooth Digestion (Inji Chooranam & Herbo-digestive aids)**

Siddha asserts that sluggish digestive fire (*Mandham*) breeds toxins (*Amam*).
- **Remedy**: Dry ginger formulation Inji Chooranam taken with hot water immediately clears post-meal bloating and stomach flatulence.
- **Product Suggestion**: Buy our *Traditional Inji Chooranam Digestive Powder* from our categories.
- **Practice**: Sip warm cumin-seed infused water throughout the day. Avoid eating fruits at night.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
    } else if (query.includes("hair") || query.includes("dandruff") || query.includes("bhringraj") || query.includes("bald")) {
      responseText = `**Lush Hair Growth & Scalp Detox (Bhringraj & Vetiver Cooling)**

Excess body thermal index ('Pitham') dries locks and destabilizes root nutrition.
- **Remedy**: Massage cooling Karisalankanni (Bhringraj) and Vetiver oil deep into the skull hair pads.
- **Product Suggestion**: Try our *Bhringraj & Vetiver Cooling Herbal Hair Oil* which contains pure floating vetiver root.
- **Advice**: Wash with hibiscus leaves or shikakai instead of sulfate chemical washes.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
    } else if (query.includes("skin") || query.includes("acne") || query.includes("glow") || query.includes("sandal") || query.includes("turmeric")) {
      responseText = `**Eczema & Glowing Skincare (Golden Nalangu Maavu Scrub)**

Siddha skincare is built upon purifying blood (*Ratham*) and treating the body's envelope naturally.
- **Remedy**: Apply Kasthuri Manjal (wild turmeric) and Vetiver paste. It acts as an organic anti-microbial shield.
- **Product Suggestion**: Use our *Golden Glow Nalangu Maavu Herbal Bath Powder* instead of normal soap.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
    } else {
      responseText = `**Greeting from Ayush Siddha Wellness Center!** 

I am your traditional AI Siddha Wellness Doctor trained on the holy teachings of Sage Agathiyar and the Pathinen Siddhargal (18 Siddhar Masters). 

You can ask me questions about:
1. **Immunity Booster Herbs** (like Kabasura Kudineer & Amukkara/Ashwagandha)
2. **Skin & Face Complexion** (Nalangu Maavu benefits)
3. **Digestive Sluggishness** (Inji Chooranam recipes)
4. **Hair Fall & Nervous Debility** (Karisalankanni & Vetiver)

*How can I help you restore your life's three-vital-humors (Vatham, Pitham, Kabham) today?*

*Disclaimer: AI consultations are strictly educational. If you have severe symptoms, please book an online appointment with our chief MS/BSMS doctor.*`;
    }

    return res.json({ response: responseText });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are "Siddhar Agathiyar AI Counselor", an elite, trustworthy, traditional Siddha healthcare consultant. You represent an ancient system of organic Indian healing (Siddha Medicine/Ayush).
Your role is to guide people seeking natural medicine and organic herbal products.
Provide rich historical backgrounds from Tamil Siddhar literature if relevant, and answer questions detailedly about traditional ingredients (Kabasura Kudineer, Amukkara Chooranam, Nalangu Maavu, Bhringraj hair oil, Inji Chooranam).
Recommend relevant catalog products when mentioned by the user - relate your suggestions to our inventory categories: [Immunity Boosters, Digestive Care, Skin Care, Hair Care].
CRITICAL RULE: Always format output in elegant Markdown. Include a tiny friendly professional medical disclaimer at the bottom of every message: '*Disclaimer: Siddha AI insights are instructional. For acute ailments, please book a personal web consultation with our certified BSMS doctor*'.`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    // To simple query
    const fullHistoryStr = (chatHistory || []).map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join("\n");
    const userMessage = `${fullHistoryStr}\nUser: ${message}`;

    const response = await chat.sendMessage({
      message: userMessage
    });

    res.json({ response: response.text });
  } catch (err: any) {
    console.error("Gemini API server side error: ", err);
    res.status(500).json({ error: "Encountered issue calling Agathiyar AI engine. Please retry." });
  }
});


// Serve static assets in production or development Vite integration
const startServer = async () => {
  // if (process.env.NODE_ENV !== "production") {
  //   const vite = await createViteServer({
  //     server: { middlewareMode: true },
  //     appType: "spa",
  //   });
  //   app.use(vite.middlewares);
  // } else {
  //   const distPath = path.join(process.cwd(), "dist");
  //   app.use(express.static(distPath));
  //   app.get("*", (req, res) => {
  //     res.sendFile(path.join(distPath, "index.html"));
  //   });
  // }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Siddha Clinic App running on port http://localhost:${PORT}`);
  });
};

startServer();
