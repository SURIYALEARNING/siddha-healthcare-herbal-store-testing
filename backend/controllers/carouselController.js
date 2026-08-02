import Carousel from "../models/Carousel.js";

const SOCIAL_ENUM = ["instagram", "youtube", "facebook", "tiktok"];

export async function getCarouselProducts(req, res) {
  try {
    let carousel = await Carousel.findOne({ isActive: true })
      .populate("products")
      .populate("socialProducts.product");
    if (!carousel) {
      return res.status(200).json({ products: [], socialProducts: [] });
    }
    const validProducts = (carousel.products || []).filter(Boolean);
    const validSocial = (carousel.socialProducts || []).filter((sp) => sp && sp.product);
    res.status(200).json({ products: validProducts, socialProducts: validSocial });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function updateCarouselProducts(req, res) {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length < 6) {
      return res.status(400).json({ error: "At least 6 products must be selected." });
    }

    let carousel = await Carousel.findOne({ isActive: true });
    if (!carousel) {
      carousel = new Carousel({ products: productIds, isActive: true });
    } else {
      carousel.products = productIds;
    }

    await carousel.save();
    res.status(200).json({ message: "Carousel updated successfully", carousel });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}

export async function updateSocialProducts(req, res) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length < 6) {
      return res.status(400).json({ error: "At least 6 products must be selected for the Social Product Marquee." });
    }

    for (const item of items) {
      if (!item || !item.productId) {
        return res.status(400).json({ error: "Each social product must have a productId." });
      }
      if (!SOCIAL_ENUM.includes(item.social)) {
        return res.status(400).json({ error: "Invalid social platform." });
      }
      if (!item.url || !String(item.url).trim().startsWith("http")) {
        return res.status(400).json({ error: "Each social product needs a valid social link (starting with http)." });
      }
    }

    const socialProducts = items.map((item) => ({
      product: item.productId,
      social: item.social,
      url: String(item.url).trim(),
    }));

    let carousel = await Carousel.findOne({ isActive: true });
    if (!carousel) {
      carousel = new Carousel({ products: [], socialProducts, isActive: true });
    } else {
      carousel.socialProducts = socialProducts;
    }

    await carousel.save();
    res.status(200).json({ message: "Social Product Marquee updated successfully", carousel });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error.message });
  }
}
