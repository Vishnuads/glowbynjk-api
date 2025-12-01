// import path from "path";
// import Product from "../model/product";
const Product = require('../model/product')
const path = require('path')

/* ---------- Helpers ---------- */
const parseMaybeJSON = (val, fallback) => {
  try {
    if (typeof val === "string") return JSON.parse(val);
    return val ?? fallback;
  } catch {
    return fallback;
  }
};

/* ---------- CREATE ---------- */
 const createProduct = async (req, res) => {
  try {
    const {
      productName,
      title,
      prices,
      netQuantity,
      stockQuantity,
      status,
      tags,
      keyBenefits,
      description,
      details,
      selectedVideo
    } = req.body;
   const imagePaths = (req.files || []).map(f => `${f.path}`);
    // const imagePaths = (req.files || []).map(f => `${f.filename}`);

    const doc = await Product.create({
      productName,
      title,
      selectedVideo,
      prices: parseMaybeJSON(prices, []).map(n => Number(n)),
      netQuantity: parseMaybeJSON(netQuantity, []).map(n => String(n)),
      stockQuantity: Number(stockQuantity || 0),
      status,
      tags: parseMaybeJSON(tags, []),
      keyBenefits: parseMaybeJSON(keyBenefits, []),
      description,
      details: parseMaybeJSON(details, {}),
      images: imagePaths
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ---------- READ (list) ---------- */
//  const getProducts = async (req, res) => {
//   try {
//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 1000);
//     const q = (req.query.q || "").trim();
//     const filter = q ? { title: { $regex: q, $options: "i" } } : {};
//     const [items, total] = await Promise.all([
//       Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
//       Product.countDocuments(filter)
//     ]);

//     res.json({
//       success: true,
//       data: items,
//       pagination: { page, limit, total, pages: Math.ceil(total / limit) }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 1000);
    const q = (req.query.q || "").trim();

    const filter = {
      ...(q ? { title: { $regex: q, $options: "i" } } : {}),
      selectedVideo: { $ne: "video-commerce" } 
    };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ---------- READ (single) ---------- */
 const getProductById = async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ---------- UPDATE ---------- */
 const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Not found" });

    const {
      productName,
      title,
      selectedVideo,
      prices,
      netQuantity,
      stockQuantity,
      status,
      tags,
      keyBenefits,
      description,
      details,
      existingImages
    } = req.body;

    const keep = parseMaybeJSON(existingImages, existing.images || []);
    
   const added = (req.files || []).map(f => `${f.path}`);
    // const added = (req.files || []).map(f => `/public/products/${f.filename}`);

    existing.productName = productName ?? existing.productName;
    existing.title = title ?? existing.title;
    existing.selectedVideo = selectedVideo ?? existing,selectedVideo;
    existing.prices = prices ? parseMaybeJSON(prices, existing.prices).map(n => Number(n)) : existing.prices;
    existing.netQuantity = netQuantity ? parseMaybeJSON(netQuantity, existing.netQuantity).map(n => String(n)) : existing.netQuantity;
    existing.stockQuantity = (stockQuantity !== undefined) ? Number(stockQuantity) : existing.stockQuantity;
    existing.status = status ?? existing.status;
    existing.tags = tags ? parseMaybeJSON(tags, existing.tags) : existing.tags;
    existing.keyBenefits = keyBenefits ? parseMaybeJSON(keyBenefits, existing.keyBenefits) : existing.keyBenefits;
    existing.description = description ?? existing.description;
    existing.details = details ? parseMaybeJSON(details, existing.details) : existing.details;
    existing.images = [...keep, ...added];

    await existing.save();
    res.json({ success: true, data: existing });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ---------- DELETE ---------- */
 const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const videoCommerceCart = async (req, res) => {
 try {
    const products = await Product.find({ selectedVideo: "video-commerce" });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};




module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    videoCommerceCart
}
