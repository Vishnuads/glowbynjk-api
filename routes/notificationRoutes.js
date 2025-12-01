// routes/notificationRoutes.js
// import express from "express";
// import { sendNotification } from "../utils/notificationService.js";
const express = require('express');
const sendNotification = require('../utils/notificationService');
const router = express.Router();

router.post("/send/notifications", async (req, res) => {
  const { userId, type, to, subject, message } = req.body;

  try {
    await sendNotification({ userId, type, to, subject, message });
    res.json({ success: true, message: "Notification sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Notification failed", error: err.message });
  }
});

module.exports = router;
