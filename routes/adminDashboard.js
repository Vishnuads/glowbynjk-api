// routes/adminDashboard.js
const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifytoken');
const { adminDashboard } = require("../controller/adminDashboard");

router.get("/admin/dashboard", verifyToken, adminDashboard);

module.exports = router;
