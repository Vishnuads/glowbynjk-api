
const express = require("express");
const Order = require("../model/Order");
const Product = require("../model/product");
const User = require("../model/userLogin");
const Coupon = require("../model/Coupon");
const Blog = require("../model/blog");
const Gift = require("../model/GiftCard");

// GET /api/admin/dashboard?filter=weekly|monthly|yearly or ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
const adminDashboard = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;

    let start = new Date();
    let end = new Date();

    // 🔹 Date filter logic
    if (filter === "weekly") {
      start.setDate(start.getDate() - 7);
    } else if (filter === "monthly") {
      start.setMonth(start.getMonth() - 1);
    } else if (filter === "yearly") {
      start.setFullYear(start.getFullYear() - 1);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      start = null;
      end = null; // full data (no date filter)
    }

    const dateFilter = start && end ? { createdAt: { $gte: start, $lte: end } } : {};

    // 🔹 Count / Stats for all sections
    const [orders, revenueAgg, products, customers, coupons, blogs, gift] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]),
      Product.countDocuments(dateFilter),
      User.countDocuments(dateFilter),
      Coupon.countDocuments(dateFilter),
      Blog.countDocuments(dateFilter),
      Gift.countDocuments(dateFilter),
    ]);

    const revenue = revenueAgg[0]?.totalRevenue || 0;

    // 🔹 Orders by status
    const ordersStatusArr = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const orderStatus = {
      Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0,
    };
    ordersStatusArr.forEach((o) => {
      orderStatus[o._id] = o.count;
    });

    // 🔹 Recent Orders
    const recentOrders = await Order.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(15)
      .select("orderNumber totalAmount status createdAt userId")
      .populate("userId", "email");

    const recentOrdersFormatted = recentOrders.map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
      userEmail: o.userId?.email || "Guest",
    }));

    // 🔹 Orders Trend (7 days)
    const today = new Date();
    const ordersTrend = [];
    const revenueTrend = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      const startDay = new Date(day.setHours(0, 0, 0, 0));
      const endDay = new Date(day.setHours(23, 59, 59, 999));

      const [dailyOrders, dailyRevenueAgg] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: startDay, $lte: endDay } }),
        Order.aggregate([
          { $match: { createdAt: { $gte: startDay, $lte: endDay } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

      ordersTrend.push({
        day: startDay.toLocaleDateString("en-US", { weekday: "short" }),
        orders: dailyOrders,
      });
      revenueTrend.push({
        day: startDay.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: dailyRevenueAgg[0]?.total || 0,
      });
    }

    // ✅ Send all results
    res.json({
      filter: filter || "all",
      orders,
      products,
      customers,
      coupons,
      blogs,
      gift,
      revenue,
      orderStatus,
      recentOrders: recentOrdersFormatted,
      ordersTrend,
      revenueTrend,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { adminDashboard };
