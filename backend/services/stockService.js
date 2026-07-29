import Batch from "../models/Batch.js";

export async function getProductStock(productId) {
  const result = await Batch.aggregate([
    { $match: { productId, status: "ACTIVE" } },
    { $group: { _id: null, total: { $sum: "$currentStock" } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
}

export async function getProductsStock(productIds) {
  const results = await Batch.aggregate([
    { $match: { productId: { $in: productIds }, status: "ACTIVE" } },
    { $group: { _id: "$productId", total: { $sum: "$currentStock" } } },
  ]);
  const map = {};
  for (const r of results) {
    map[r._id.toString()] = r.total;
  }
  return map;
}
