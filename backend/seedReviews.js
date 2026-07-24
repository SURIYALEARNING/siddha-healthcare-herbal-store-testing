import mongoose from "mongoose";
import "dotenv/config";
import Product from "./models/Product.js";
import Review from "./models/Review.js";

const FIRST_NAMES = [
  "Suriya", "Kumar", "Priya", "Arun", "Divya", "Ravi", "Anita", "Vikram",
  "Lakshmi", "Mohan", "Kavitha", "Rajesh", "Meena", "Suresh", "Pooja",
  "Ganesh", "Nalini", "Deepak", "Saraswati", "Murugan", "Geetha", "Prakash",
  "Valli", "Bala", "Selvi", "Karthik", "Uma", "Sridhar", "Vimala", "Ramesh",
];

const REVIEW_TEMPLATES = [
  { rating: 5, title: "Life-changing remedy", comment: "I have been using this for a month and the results are remarkable. My digestion has improved significantly. Highly recommend to anyone suffering from similar issues." },
  { rating: 5, title: "Pure Siddha magic", comment: "Absolutely authentic Siddha formulation. Felt the difference within a week. The traditional preparation method really makes a difference." },
  { rating: 5, title: "Better than modern medicine", comment: "After years of allopathic treatment with no results, this Siddha remedy finally gave me relief. Forever grateful to this ancient science." },
  { rating: 4, title: "Very effective", comment: "Good quality product. Works as described. Took a bit longer than expected but the results are lasting and natural." },
  { rating: 4, title: "Worth purchasing", comment: "Genuine product with authentic ingredients. Noticed improvement in my skin condition after 3 weeks of regular use." },
  { rating: 4, title: "Good quality", comment: "The product arrived well packaged. The ingredients are fresh and potent. Will definitely repurchase once this runs out." },
  { rating: 3, title: "Average experience", comment: "It works but takes time. Need to be patient with Siddha medicine. Results are slow but steady. Would recommend trying for at least 2 months." },
  { rating: 3, title: "Decent product", comment: "Not bad for the price. Could be more effective but it does help to some extent. Might work better for different body types." },
  { rating: 5, title: "My whole family uses this", comment: "Ordered this after my mother's recommendation. Now the entire family uses it. Truly a blessing from our Siddha tradition." },
  { rating: 4, title: "Consistent quality", comment: "Third time ordering. The quality has been consistent every time. Trustworthy brand for Siddha medicines." },
  { rating: 5, title: "Amazing results for hair", comment: "My hair fall has reduced drastically after using this for 45 days. The herbal ingredients are gentle yet effective." },
  { rating: 4, title: "Natural and pure", comment: "Love that there are no chemicals. The herbal smell is pleasant and reassuring. Feels good to use something natural." },
  { rating: 5, title: "Grandmother's recommendation", comment: "My grandmother suggested this and I am so glad I listened. Traditional knowledge passed down for generations really works." },
  { rating: 2, title: "Did not work for me", comment: "Unfortunately did not see any noticeable changes. But Siddha medicine works differently for different people so still giving it a try." },
  { rating: 4, title: "Quick delivery, good product", comment: "Packaging was excellent. The product looks and smells fresh. Will update after completing the full course." },
  { rating: 5, title: "Perfect for daily use", comment: "Incorporated into my daily routine. Feeling more energetic and balanced. The price is also very reasonable for the quality." },
  { rating: 3, title: "Takes time", comment: "Siddha medicine is not instant. It has been 3 weeks and I can see subtle improvements. Patience is key with herbal remedies." },
  { rating: 5, title: "Best in class", comment: "Tried many brands but this is by far the best. The potency and purity are evident. A true Siddha product." },
  { rating: 5, title: "Doctor recommended", comment: "Our Siddha doctor recommended this particular formulation. Authentic preparation as per ancient texts. Very satisfied." },
  { rating: 4, title: "Good for maintenance", comment: "Using this as a preventive measure. Feel healthier overall. Good for those who want to maintain their health naturally." },
  { rating: 5, title: "Third purchase", comment: "This is my third time buying. Consistent quality and effectiveness. Have recommended to all my friends and family." },
  { rating: 4, title: "Reliable brand", comment: "Trustworthy Siddha brand. The product details and ingredients are clearly mentioned. Shipping was also prompt." },
  { rating: 5, title: "Outstanding", comment: "Really outstanding product. The difference in my health is visible to everyone around me. Thank you for this wonderful formulation." },
  { rating: 4, title: "Good value", comment: "Reasonable pricing for the quality offered. The effects are gradual but genuine. Will continue using." },
  { rating: 5, title: "Authentic taste and smell", comment: "The taste and smell are exactly how my grandmother used to prepare. Authenticity is clearly maintained in this product." },
];

const CATEGORIES = ["Immunity Boosters", "Digestive Care", "Skin Care", "Hair Care"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysBack));
  return d;
}

const SAMPLE_PRODUCTS = [
  { name: "Kabasura Kudineer", price: 250, discountPrice: 199, stock: 45, description: "Traditional Siddha herbal formulation for immunity support. Made with 15 rare herbs." },
  { name: "Amukkara Choornam", price: 180, discountPrice: 149, stock: 60, description: "Pure herbal powder to boost strength and vitality. Rich in natural adaptogens." },
  { name: "Thippili Rasayanam", price: 350, discountPrice: 299, stock: 30, description: "Herbal jam for respiratory wellness. Made from long pepper and honey base." },
  { name: "Karisalai Lehyam", price: 420, discountPrice: 349, stock: 25, description: "Traditional herbal formulation for skin health and blood purification." },
  { name: "Brahmi Nei", price: 550, discountPrice: 449, stock: 20, description: "Clarified butter medicated with Brahmi for memory and mental clarity." },
  { name: "Kumari Kizhangu Choornam", price: 200, discountPrice: 169, stock: 55, description: "Aloe vera based herbal powder for digestive health and skin glow." },
  { name: "Sirunagapoo Choornam", price: 160, discountPrice: 129, stock: 70, description: "Natural antimicrobial powder for wound healing and skin infections." },
  { name: "Vasambu Choornam", price: 140, discountPrice: 119, stock: 80, description: "Classic Siddha remedy for digestive issues in children and adults." },
  { name: "Kodoriveli Chunnam", price: 280, discountPrice: 229, stock: 35, description: "Traditional calcium supplement for bone strength and joint health." },
  { name: "Nilavembu Kudineer", price: 230, discountPrice: 189, stock: 50, description: "Fever-reducing Siddha formulation for viral infections and flu." },
  { name: "Athimathuram Powder", price: 120, discountPrice: 99, stock: 100, description: "Pure licorice root powder for sore throat and cough relief." },
  { name: "Seenthil Choornam", price: 190, discountPrice: 159, stock: 40, description: "Herbal powder from Tinospora cordifolia for immunity and liver health." },
  { name: "Pungam Ennai", price: 320, discountPrice: 269, stock: 28, description: "Medicated oil for skin conditions, eczema and psoriasis relief." },
  { name: "Vennai Karpam", price: 680, discountPrice: 549, stock: 15, description: "Premium Siddha rejuvenator made with ghee and 28 herbal extracts." },
  { name: "Aya Brinthat Chunnam", price: 450, discountPrice: 379, stock: 22, description: "Traditional iron supplement for anemia and blood purification." },
  { name: "Sangu Parpam", price: 520, discountPrice: 429, stock: 18, description: "Conch shell calcium preparation for digestive disorders and ulcers." },
  { name: "Karpoora Silasathu", price: 380, discountPrice: 319, stock: 32, description: "Camphor based herbal tablet for cold and respiratory congestion." },
  { name: "Adhimadura Choornam", price: 170, discountPrice: 139, stock: 65, description: "Sweet herbal powder blend for digestive wellness and appetite." },
  { name: "Idivalam Kathigai", price: 290, discountPrice: 239, stock: 38, description: "Herbal tablet for menstrual health and hormonal balance." },
  { name: "Thalangaikari Choornam", price: 210, discountPrice: 179, stock: 48, description: "Traditional powder for dental health and gum strengthening." },
];

async function seed() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to MongoDB");

    // Create products
    const existingCount = await Product.countDocuments();
    if (existingCount < 20) {
      console.log("Seeding products...");
      for (const p of SAMPLE_PRODUCTS) {
        const categoryIndex = SAMPLE_PRODUCTS.indexOf(p) % CATEGORIES.length;
        const exists = await Product.findOne({ name: p.name });
        if (!exists) {
          await Product.create({
            ...p,
            discountPrice: p.discountPrice || p.price,
            category: CATEGORIES[categoryIndex],
            ingredients: ["Herbal Extract", "Natural Minerals", "Organic Base"],
            benefits: ["Traditional wellness", "Natural healing", "No side effects"],
            usageInstructions: ["Take as directed by physician", "Store in cool dry place", "Keep away from children"],
            images: [
              "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
            ],
            reviewStats: { averageRating: 0, totalReviews: 0, rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 },
          });
        }
      }
      console.log("Products seeded");
    } else {
      console.log("Products already exist, skipping product seed");
    }

    // Create reviews
    const products = await Product.find({});
    let totalReviews = 0;

    for (const product of products) {
      const existingReviews = await Review.countDocuments({ productId: product._id });
      if (existingReviews > 0) {
        console.log(`Reviews exist for ${product.name}, skipping`);
        totalReviews += existingReviews;
        continue;
      }

      const reviewCount = randomInt(5, 15);
      const reviews = [];

      for (let i = 0; i < reviewCount; i++) {
        const template = randomItem(REVIEW_TEMPLATES);
        const firstName = randomItem(FIRST_NAMES);
        const lastName = randomItem(["S", "K", "R", "M", "A", "P", "G", "V"]);
        const daysBack = 120;
        const date = randomDate(daysBack);
        const isVerified = Math.random() > 0.2;

        reviews.push({
          productId: product._id,
          userId: null,
          userName: `${firstName} ${lastName}.`,
          userAvatar: "",
          rating: template.rating,
          title: template.title,
          comment: template.comment,
          images: [],
          isVerifiedPurchase: isVerified,
          isApproved: true,
          helpfulCount: randomInt(0, 25),
          helpfulBy: [],
          createdAt: date,
          updatedAt: date,
        });
      }

      if (reviews.length > 0) {
        await Review.insertMany(reviews);
        totalReviews += reviews.length;

        // Update reviewStats
        const stats = { rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0, totalReviews: reviews.length };
        let sum = 0;
        for (const r of reviews) {
          const key = `rating${r.rating}`;
          stats[key]++;
          sum += r.rating;
        }
        const averageRating = Number((sum / reviews.length).toFixed(1));
        await Product.findByIdAndUpdate(product._id, {
          reviewStats: { ...stats, averageRating },
        });
      }

      console.log(`Seeded ${reviews.length} reviews for ${product.name}`);
    }

    console.log(`\nSeeding complete! Total reviews created: ${totalReviews}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
