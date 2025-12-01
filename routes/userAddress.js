const express = require("express");
const auth = require("../middleware/verifytoken"); 
const { addressGet, createAddress, mergeAddress } = require("../controller/userAddress");
const router = express.Router();


router.get("/users/:id/addresses", auth, addressGet)
router.post("/users/:id/addresses", auth, createAddress)
router.post("/users/:id/addresses/merge", auth, mergeAddress)

module.exports = router