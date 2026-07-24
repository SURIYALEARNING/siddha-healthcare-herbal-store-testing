import { Review, ReviewStats, Product } from "../types";

const FIRST_NAMES = [
  "Suriya", "Kumar", "Priya", "Arun", "Divya", "Ravi", "Anita", "Vikram",
  "Lakshmi", "Mohan", "Kavitha", "Rajesh", "Meena", "Suresh", "Pooja",
  "Ganesh", "Nalini", "Deepak", "Saraswati", "Murugan", "Geetha", "Prakash",
  "Valli", "Bala", "Selvi", "Karthik", "Uma", "Sridhar", "Vimala", "Ramesh",
];

const REVIEW_TEMPLATES = [
  { rating: 5, title: "Life-changing remedy", comment: "I have been using this for a month and the results are remarkable. My digestion has improved significantly." },
  { rating: 5, title: "Pure Siddha magic", comment: "Absolutely authentic Siddha formulation. Felt the difference within a week." },
  { rating: 4, title: "Very effective", comment: "Good quality product. Works as described. Results are lasting and natural." },
  { rating: 4, title: "Worth purchasing", comment: "Genuine product with authentic ingredients. Noticed improvement after 3 weeks." },
  { rating: 5, title: "Amazing results for hair", comment: "My hair fall has reduced drastically after using this for 45 days." },
  { rating: 5, title: "Best in class", comment: "Tried many brands but this is by far the best. The potency and purity are evident." },
  { rating: 3, title: "Average experience", comment: "It works but takes time. Need to be patient with Siddha medicine." },
  { rating: 4, title: "Good value", comment: "Reasonable pricing for the quality offered. Will continue using." },
  { rating: 5, title: "Doctor recommended", comment: "Our Siddha doctor recommended this. Very satisfied with the results." },
  { rating: 4, title: "Consistent quality", comment: "Third time ordering. The quality has been consistent every time." },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysBack));
  return d;
}

export function generateDummyReviews(productId: string, count: number = randomInt(5, 15)): Review[] {
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    const template = randomItem(REVIEW_TEMPLATES);
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(["S", "K", "R", "M", "A", "P", "G", "V"]);
    const date = randomDate(120);
    reviews.push({
      _id: `dummy-review-${productId}-${i}`,
      productId,
      userName: `${firstName} ${lastName}.`,
      rating: template.rating,
      title: template.title,
      comment: template.comment,
      isVerifiedPurchase: Math.random() > 0.2,
      isApproved: true,
      helpfulCount: randomInt(0, 20),
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateDummyReviewStats(reviews: Review[]): ReviewStats {
  const stats = { rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0, totalReviews: reviews.length, averageRating: 0 };
  let sum = 0;
  for (const r of reviews) {
    const key = `rating${r.rating}` as keyof typeof stats;
    stats[key] = (stats[key] as number) + 1;
    sum += r.rating;
  }
  stats.averageRating = reviews.length > 0 ? Number((sum / reviews.length).toFixed(1)) : 0;
  return stats;
}

export function attachDummyReviewsToProducts(products: Product[]): Product[] {
  return products.map((p) => {
    if (p.reviewStats && p.reviewStats.totalReviews > 0) return p;
    const dummyReviews = generateDummyReviews(p._id);
    const stats = generateDummyReviewStats(dummyReviews);
    return {
      ...p,
      reviewStats: stats,
      latestReviews: dummyReviews.slice(0, 3).map((r) => ({
        _id: r._id,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    };
  });
}
