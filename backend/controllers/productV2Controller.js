import ProductV2 from "../models/ProductV2.js";

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      featured,
      active,
    } = req.query;

    const filter = {};

    if (active === "true") filter.isActive = true;
    if (featured === "true") filter.isFeatured = true;
    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { "name.en": { $regex: search, $options: "i" } },
        { "name.ta": { $regex: search, $options: "i" } },
        { "shortDescription.en": { $regex: search, $options: "i" } },
        { "shortDescription.ta": { $regex: search, $options: "i" } },
        { "tags.en": { $regex: search, $options: "i" } },
        { "tags.ta": { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    else if (sort === "price-desc") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { averageRating: -1 };
    else if (sort === "name") sortOption = { "name.en": 1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "best-selling") sortOption = { totalReviews: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      ProductV2.find(filter)
        .populate("category", "name slug image")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProductV2.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await ProductV2.findOne({ "slug.en": slug })
      .populate("category", "name slug image description")
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductV2.findById(id)
      .populate("category", "name slug image")
      .lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await ProductV2.create(req.body);
    const populated = await ProductV2.findById(product._id)
      .populate("category", "name slug image")
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Product with this slug already exists" });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductV2.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug image");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Product with this slug already exists" });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductV2.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
