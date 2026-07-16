import Product from "../models/Product.js";

export async function addReview(req, res) {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });

    const newReview = {
      id: "rev-" + Date.now(),
      user: req.user?.fullName || "Guest Buyer",
      rating: Number(rating) || 5,
      comment: comment || "Excellent Siddha healthcare item.",
      date: new Date().toISOString().split("T")[0],
    };

    product.reviews.push(newReview);
    const totalR = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    product.rating = Number((totalR / product.reviews.length).toFixed(1));
    await product.save();

    res.status(201).json({
      message: "Review added successfully!",
      reviews: product.reviews,
      rating: product.rating,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add review." });
  }
}
