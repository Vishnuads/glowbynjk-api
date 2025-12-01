const express = require('express');
const {
  createProductSlider,
  deleteProductSlider,
  getProductSlider,
  getProductSliderById,
  updateProductSlider,
  upload,
} = require('../controller/videocommerce');

const router = express.Router();

router.post( '/videocommerce', upload.fields([{ name: "productvideo", maxCount: 1 }]),createProductSlider);
router.get('/videocommerce', getProductSlider);
router.get('/videocommerce/:id', getProductSliderById);
router.put(  '/videocommerce/:id',upload.fields([{ name: "productvideo", maxCount: 1 }]), updateProductSlider);
router.delete('/videocommerce/:id', deleteProductSlider);

module.exports = router;
