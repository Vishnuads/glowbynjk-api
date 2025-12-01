const ProductSlider = require('../model/videocommerce'); // ✅ path
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;





// 1️⃣ Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// 2️⃣ Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "glowbynjk/videos", 
//     resource_type: "video",
//     public_id: (req, file) => Date.now() + "-" + file.originalname.split(".")[0],
//   },
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/videos'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

// 3️⃣ Multer setup with video-only filter
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|wmv/;
    const extName = allowedTypes.test(file.originalname.toLowerCase());
    const mimeType = file.mimetype.startsWith("video/");

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // optional: limit 100MB
});

// CREATE
const createProductSlider = async (req, res) => {
  try {
    const bannerData = {
      productname: req.body.productname,
      title: req.body.title,
      priceone: req.body.priceone,
      pricetwo: req.body.pricetwo,
      productvideo: req.files.productvideo?.[0]?.path,
    };
    const banner = new ProductSlider(bannerData);
    const saved = await banner.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Create banner error:", err);
    res.status(500).json({ message: err.message });
  }
};

// READ ALL
const getProductSlider = async (req, res) => {
  try {
    const banners = await ProductSlider.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ SINGLE
const getProductSliderById = async (req, res) => {
  try {
    const banner = await ProductSlider.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
const updateProductSlider = async (req, res) => {
  try {
    const updateData = {
      productname: req.body.productname,
      title: req.body.title,
      priceone: req.body.priceone,
      pricetwo: req.body.pricetwo,
    };
    if (req.files.productvideo)
      updateData.productvideo = req.files.productvideo[0].path;
    const updated = await ProductSlider.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Banner not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
const deleteProductSlider = async (req, res) => {
  try {
    const deleted = await ProductSlider.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProductSlider,
  getProductSlider,
  getProductSliderById,
  updateProductSlider,
  deleteProductSlider,
  upload,
};
