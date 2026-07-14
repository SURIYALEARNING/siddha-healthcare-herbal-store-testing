import express from "express";
import Product from "../models/Product.js";
import { verifyToken, verifyAdmin } from '../Auth/authMiddleware.js'
import { getLoggedUser } from '../server.js'

const router = express.Router();

// Placeholder for JWT Middleware (Enable this later)
// import { protect } from "../middleware/authMiddleware.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public (Will change to Private later)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error, products fetch panna mudiyala", error: error.message });
  }
});


// const getLoggedUser = (req) => {
//   // right now returning dummy admin for your testing, change as per your setup
//   return { id: "user-1", isAdmin: true };
// };


// @desc    Admin Product Management - Add new product
// @route   POST /api/products/manage
// @access  Private (Admin Only)
router.post("/manage", verifyAdmin, async (req, res) => {
  console.log("product create");

  try {


    const { name, price, discountPrice, stock, category, description, ingredients, benefits, usageInstructions, images } = req.body;

    // Validation
    if (!name || !price || !category || !description) {
      return res.status(400).json({ error: "Name, price, category and description are required requirements." });
    }



    function generateProductId() {
      const randomNum = Math.floor(Math.random() * 10000);
      return `prod-${randomNum}`;
    }

    // DB insert panna porom
    const newProduct = await Product.create({
      id: generateProductId(),
      name,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : Number(price),
      stock: Number(stock) || 10,
      category,
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      usageInstructions: Array.isArray(usageInstructions) ? usageInstructions : [],
      images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"],
      rating: 5.0,
      reviews: [] // Starts clean with empty reviews
    });

    res.status(201).json({
      message: "Product created successfully in MongoDB!",
      product: newProduct
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      error: "Server Error, product-ah database-la save panna mudiyala",
      details: error.message
    });
  }
});



// @desc    Admin Product Management - Delete a product
// @route   DELETE /api/products/manage/:id
// @access  Private (Admin Only)
// @desc    Admin Product Management - Update an existing product
// @route   PUT /api/products/manage/:id
// @access  Private (Admin Only)
router.put("/manage/:id", async (req, res) => {
  try {
    const user = getLoggedUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access forbidden. Admin privilege required." });
    }

    const productId = req.params.id; // URL-la irundhu 'prod-X' eduthukum
    const updateData = req.body;

    // Data-va dynamic-ah handle panni database-la update panrom
    // { new: true } pota thaan update aana pudhu data res-la thirumbi varum
    const updatedProduct = await Product.findOneAndUpdate(
      { id: productId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product select panna ID-la edhuvum illai!" });
    }

    res.status(200).json({
      message: "Product updated successfully in MongoDB!",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      error: "Server Error, product update panna mudiyala",
      details: error.message
    });
  }
});// replace 'put' with 'delete' line below when testing



router.delete("/manage/:id", async (req, res) => {
  try {
    const user = getLoggedUser(req);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access forbidden. Admin privilege required." });
    }

    const productId = req.params.id;

    // Database-la irundhu match aagura product-ah delete panrom
    const deletedProduct = await Product.findOneAndDelete({ id: productId });

    if (!deletedProduct) {
      return res.status(404).json({ error: "Delete panna nenecha product database-la illai!" });
    }

    res.status(200).json({
      message: "Product deleted successfully from MongoDB!",
      deletedProductCustomId: productId
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "Server Error, product delete panna mudiyala",
      details: error.message
    });
  }
});

export default router;