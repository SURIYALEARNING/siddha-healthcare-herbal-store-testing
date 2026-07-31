import Product from "../models/Product.js";
import { getProductsWithLatestReviews, getLatestReviews } from "../services/reviewService.js";
import { deleteMedia } from "../services/uploadService.js";
import { getProductStock, getProductsStock } from "../services/stockService.js";

export async function getAllProducts(req, res) {
  try {
    const { page = 1, limit = 50, category, search, sort, scope } = req.query;
    
    const result = await getProductsWithLatestReviews({
      page: Number(page), limit: Number(limit),
      category, search, sort, scope,
    });

    const productIds = result.products.map(p => p._id);
    const stockMap = await getProductsStock(productIds);
    for (const product of result.products) {
      product.stock = stockMap[product._id.toString()] || 0;
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getProductById(req, res) {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      return res.status(400).json({ error: "Invalid product ID format." });
    }
    const product = await Product.findById(req.params.id).lean();
    if (!product || product.isActive === false) return res.status(404).json({ error: "Product not found" });
    product.stock = await getProductStock(product._id);
    const latestReviews = await getLatestReviews(product._id, 3);
    res.status(200).json({ ...product, latestReviews });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, price, discountPrice, stock, category, description, ingredients, benefits, usageInstructions, images, media } = req.body;
    if (!name || price === undefined || !category) {
      return res.status(400).json({ error: "Name, price, and category are required." });
    }

    const productData = {
      name: typeof name === "string" ? { en: name, ta: "" } : name,
      price: Math.max(0, Number(price)),
      discountPrice: discountPrice ? Math.max(0, Number(discountPrice)) : Math.max(0, Number(price)),
      category,
      isActive: true,
    };

    if (description) {
      productData.description = typeof description === "string" ? { en: description, ta: "" } : description;
    }
    if (req.body.productMotto) {
      productData.productMotto = typeof req.body.productMotto === "string" ? { en: req.body.productMotto, ta: "" } : req.body.productMotto;
    }
    if (req.body.shortDescription) {
      productData.shortDescription = typeof req.body.shortDescription === "string" ? { en: req.body.shortDescription, ta: "" } : req.body.shortDescription;
    }
    if (req.body.expiryDuration) {
      productData.expiryDuration = typeof req.body.expiryDuration === "string" ? { en: req.body.expiryDuration, ta: "" } : req.body.expiryDuration;
    }
    if (req.body.size) productData.size = req.body.size;
    if (req.body.isFeatured !== undefined) productData.isFeatured = req.body.isFeatured;
    if (req.body.visibility) productData.visibility = req.body.visibility;
    if (req.body.averageRating !== undefined) productData.averageRating = req.body.averageRating;
    if (req.body.totalReviews !== undefined) productData.totalReviews = req.body.totalReviews;

    const mapToTrans = (items) => {
      if (!Array.isArray(items)) return [];
      return items.map((item) => {
        if (typeof item === "string") return { en: item, ta: "" };
        return item;
      });
    };

    if (ingredients) productData.ingredients = mapToTrans(ingredients);
    if (benefits) productData.benefits = mapToTrans(benefits);
    if (usageInstructions) productData.usageInstructions = mapToTrans(usageInstructions);
    if (req.body.safetyInstructions) productData.safetyInstructions = mapToTrans(req.body.safetyInstructions);
    if (req.body.storageInstructions) productData.storageInstructions = mapToTrans(req.body.storageInstructions);
    if (req.body.tags) productData.tags = mapToTrans(req.body.tags);

    productData.images = Array.isArray(images) && images.length > 0
      ? images
      : ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"];
    if (Array.isArray(media) && media.length > 0) {
      productData.media = media;
    }

    const newProduct = await Product.create(productData);
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}

export async function updateProduct(req, res) {
  try {
    const updates = { ...req.body };
    delete updates.stock;

    const transFields = ["name", "description", "productMotto", "shortDescription", "expiryDuration"];
    for (const field of transFields) {
      if (updates[field] && typeof updates[field] === "string") {
        updates[field] = { en: updates[field], ta: "" };
      }
    }

    const transArrays = ["ingredients", "benefits", "usageInstructions", "safetyInstructions", "storageInstructions", "tags"];
    for (const field of transArrays) {
      if (updates[field] && Array.isArray(updates[field])) {
        updates[field] = updates[field].map((item) => {
          if (typeof item === "string") return { en: item, ta: "" };
          return item;
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, { $set: updates }, { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}

export async function deleteProduct(req, res) {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    if (deletedProduct.media && deletedProduct.media.length > 0) {
      const publicIds = deletedProduct.media.map((m) => m.publicId).filter(Boolean);
      if (publicIds.length > 0) {
        deleteMedia(publicIds).catch((err) => console.error("Cloudinary cleanup error:", err));
      }
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
}
