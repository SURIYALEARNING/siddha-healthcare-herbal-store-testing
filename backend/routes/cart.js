import express from "express";
import Cart from "../models/Cart.js";
import { verifyToken } from "../Auth/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  console.log("card get");

  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = { userId: req.user.id, items: [] };
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart." });
  }
});

router.post("/add", verifyToken, async (req, res) => {
 
  try {
    
    const { productId, name, price, discountPrice, quantity, image } = req.body;
    console.log(req.body, req.user);
    
    if (!productId || !name || !price || !quantity) {
      return res.status(400).json({ error: "Missing required cart item fields." });
    }

    let cart = await Cart.findOne({ userId: req.user.id });


    if (!cart) {

      cart = new Cart({ userId: req.user.id, items: [] });
  

    }

    const existingIndex = cart.items.findIndex(i => i.productId === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, discountPrice, quantity, image });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to add item to cart." });
  }
});

router.put("/update/:productId", verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1." });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    const item = cart.items.find(i => i.productId === req.params.productId);
    if (!item) {
      return res.status(404).json({ error: "Item not found in cart." });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart item." });
  }
});

router.delete("/remove/:productId", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    cart.items = cart.items.filter(i => i.productId !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove item from cart." });
  }
});

router.delete("/clear", verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared." });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cart." });
  }
});

router.post("/sync", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items must be an array." });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    for (const incoming of items) {
      const existing = cart.items.find(i => i.productId === incoming.productId);
      if (existing) {
        existing.quantity = Math.max(existing.quantity, incoming.quantity);
      } else {
        cart.items.push(incoming);
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to sync cart." });
  }
});

export default router;
