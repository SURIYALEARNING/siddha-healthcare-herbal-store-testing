import state from '../data/index.js';
import { getLoggedUser } from '../services/authHelper.js';

export function addReview(req, res) {
  const user = getLoggedUser(req);
  const username = user ? user.fullName : "Guest Buyer";
  const { rating, comment } = req.body;

  const product = state.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found." });

  const newReview = {
    id: "rev-" + Date.now(),
    user: username,
    rating: Number(rating) || 5,
    comment: comment || "Excellent Siddha healthcare item.",
    date: new Date().toISOString().split("T")[0]
  };

  product.reviews.push(newReview);
  const totalR = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
  product.rating = Number((totalR / product.reviews.length).toFixed(1));

  res.status(201).json({ message: "Review added successfully!", reviews: product.reviews, rating: product.rating });
}
