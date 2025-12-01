const express = require('express');
const {
  createProductSlider,
  deleteProductSlider,
  getProductSlider,
  getProductSliderById,
  updateProductSlider,
  upload,
} = require('../controller/productSlider');

const router = express.Router();

router.post(
  '/product/slider',
  upload.fields([{ name: 'productimage', maxCount: 1 },{ name: 'offerimage', maxCount: 1 }, ]),
  createProductSlider
);

router.get('/product/slider', getProductSlider);
router.get('/product/slider/:id', getProductSliderById);

router.put(
  '/product/slider/:id',
  upload.fields([
    { name: 'productimage', maxCount: 1 },
    { name: 'offerimage', maxCount: 1 },
  ]),
  updateProductSlider
);

router.delete('/product/slider/:id', deleteProductSlider);

module.exports = router;
