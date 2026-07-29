import Carousel from "../models/Carousel.js";

export async function getCarouselProducts(req, res) {
  try {
    let carousel = await Carousel.findOne({ isActive: true }).populate("products");
    if (!carousel) {
      return res.status(200).json({ products: [] });
    }
    const validProducts = (carousel.products || []).filter(Boolean);
    res.status(200).json({ products: validProducts });
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
