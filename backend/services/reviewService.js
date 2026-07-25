import Review from "../models/Review.js";
import Product from "../models/Product.js";

function calculateAverage(stats) {
  const total = stats.rating1 + stats.rating2 + stats.rating3 + stats.rating4 + stats.rating5;
  if (total === 0) return 0;
  const sum = stats.rating1 * 1 + stats.rating2 * 2 + stats.rating3 * 3 + stats.rating4 * 4 + stats.rating5 * 5;
  return Number((sum / total).toFixed(1));
}

export async function updateReviewStats(productId) {
  const stats = await Review.aggregate([
    { $match: { productId: productId, isApproved: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
      },
    },
  ]);

  const s = stats[0] || { totalReviews: 0, rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 };
  const reviewStats = {
    averageRating: calculateAverage(s),
    totalReviews: s.totalReviews,
    rating1: s.rating1,
    rating2: s.rating2,
    rating3: s.rating3,
    rating4: s.rating4,
    rating5: s.rating5,
  };

  await Product.findByIdAndUpdate(productId, {
    reviewStats,
    averageRating: reviewStats.averageRating,
    totalReviews: reviewStats.totalReviews,
  });
  return reviewStats;
}

export async function createReview({ productId, userId, userName, userAvatar, rating, title, comment, images, isVerifiedPurchase }) {
  const review = await Review.create({
    productId, userId, userName, userAvatar,
    rating, title, comment, images,
    isVerifiedPurchase: isVerifiedPurchase || false,
    isApproved: false,
  });

  await updateReviewStats(productId);
  return review;
}

export async function updateReview(reviewId, userId, updates) {
  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) return null;

  const oldRating = review.rating;
  if (updates.rating !== undefined) review.rating = updates.rating;
  if (updates.title !== undefined) review.title = updates.title;
  if (updates.comment !== undefined) review.comment = updates.comment;
  if (updates.images !== undefined) review.images = updates.images;

  await review.save();

  if (updates.rating !== undefined && oldRating !== updates.rating) {
    await updateReviewStats(review.productId);
  }

  return review;
}

export async function deleteReview(reviewId, userId) {
  const review = await Review.findOne({ _id: reviewId, userId });
  if (!review) return null;

  const { productId } = review;
  await Review.deleteOne({ _id: reviewId });
  await updateReviewStats(productId);

  return { deleted: true };
}

export async function getProductReviews(productId, { page = 1, limit = 10, rating, sort = "newest" }) {
  const filter = { productId, isApproved: true };
  if (rating) filter.rating = Number(rating);

  let sortOption = { createdAt: -1 };
  if (sort === "oldest") sortOption = { createdAt: 1 };
  if (sort === "highest") sortOption = { rating: -1, createdAt: -1 };
  if (sort === "lowest") sortOption = { rating: 1, createdAt: -1 };

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductReviewStats(productId) {
  const product = await Product.findById(productId).select("reviewStats").lean();
  return product?.reviewStats || null;
}

export async function getLatestReviews(productId, limit = 3) {
  return Review.find({ productId, isApproved: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("userName rating comment createdAt")
    .lean();
}

export async function getProductsWithLatestReviews({ page = 1, limit = 12, category, search, sort }) {
  const match = {};

  if (category && category !== "All") {
    match.$or = [
      { category: category },
      { "category.name.en": category },
      { "category._id": category },
    ];
  }

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    match.$or = (match.$or || []).concat([
      { "name.en": searchRegex },
      { "name.ta": searchRegex },
      { "description.en": searchRegex },
      { "description.ta": searchRegex },
      { "shortDescription.en": searchRegex },
      { "shortDescription.ta": searchRegex },
    ]);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price-low") sortOption = { discountPrice: 1 };
  if (sort === "price-high") sortOption = { discountPrice: -1 };
  if (sort === "rating") sortOption = { "reviewStats.averageRating": -1 };

  const skip = (page - 1) * limit;

  const pipeline = [
    { $sort: sortOption },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "categories",
        let: { catId: "$category" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  "$_id",
                  { $convert: { input: "$$catId", to: "objectId", onError: null, onNull: null } },
                ],
              },
            },
          },
        ],
        as: "categoryLookup",
      },
    },
    {
      $addFields: {
        category: {
          $cond: {
            if: { $gt: [{ $size: "$categoryLookup" }, 0] },
            then: { $arrayElemAt: ["$categoryLookup", 0] },
            else: "$category",
          },
        },
      },
    },
    {
      $lookup: {
        from: "reviews",
        let: { pid: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$productId", "$$pid"] }, isApproved: true } },
          { $sort: { createdAt: -1 } },
          { $limit: 3 },
          { $project: { _id: 1, userName: 1, rating: 1, comment: { $substrCP: ["$comment", 0, 100] }, createdAt: 1 } },
        ],
        as: "latestReviews",
      },
    },
    { $project: { categoryLookup: 0 } },
  ];

  if (Object.keys(match).length > 0) {
    pipeline.unshift({ $match: match });
  }

  const [products, total] = await Promise.all([
    Product.aggregate(pipeline),
    Product.countDocuments(match),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function approveReview(reviewId) {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { isApproved: true },
    { new: true }
  );
  if (!review) return null;

  await updateReviewStats(review.productId);
  return review;
}

export async function markHelpful(reviewId, userId) {
  const review = await Review.findById(reviewId);
  if (!review) return null;

  if (review.helpfulBy.includes(userId)) {
    return { alreadyVoted: true };
  }

  review.helpfulBy.push(userId);
  review.helpfulCount = review.helpfulBy.length;
  await review.save();

  return { helpfulCount: review.helpfulCount };
}

export async function getLatestReviewsAll(limit = 10) {
  return Review.find({ isApproved: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("productId", "name images")
    .select("userName rating comment createdAt productId")
    .lean();
}
