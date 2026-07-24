import Product from "../models/Product.js";
import { getProductsWithLatestReviews, getLatestReviews } from "../services/reviewService.js";

export async function getAllProducts(req, res) {
  try {
    const { page = 1, limit = 50, category, search, sort } = req.query;

    const result = await getProductsWithLatestReviews({
      page: Number(page),
      limit: Number(limit),
      category,
      search,
      sort,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const latestReviews = await getLatestReviews(product._id, 3);
    console.log(product, latestReviews);

    res.status(200).json({ ...product, latestReviews });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, price, discountPrice, stock, category, description, ingredients, benefits, usageInstructions, images } = req.body;

    if (!name || !price || !category || !description) {
      return res.status(400).json({ error: "Name, price, category and description are required." });
    }

    const newProduct = await Product.create({
      name,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : Number(price),
      stock: Number(stock) || 10,
      category,
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      usageInstructions: Array.isArray(usageInstructions) ? usageInstructions : [],
      images: Array.isArray(images) && images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"],
    });

    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}
