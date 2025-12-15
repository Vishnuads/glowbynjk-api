const express = require('express');
const app = express(); 
const path = require('path');
const dotenv = require('dotenv');
 dotenv.config({path:path.join(__dirname,'config','.env')})
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const puppeteer = require("puppeteer");
const mongoose = require('mongoose')
app.use(express.json({ limit: "2mb" }));  
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const webpush = require("web-push");
// ✅ Load environment variables (Railway loads from dashboard automatically)
dotenv.config();

// ✅ Server port
const PORT = process.env.PORT || 3000;





// ✅ Database connection
const database = require('./config/database');
database();

// ✅ Middleware
app.use(
  cors({
    origin: [
      "https://www.glowbynjk.com",
      "https://glowbynjk.com",
      "https://admin.glowbynjk.com",
      "https://glowbynjk-test01.netlify.app",
      "http://localhost:5173",
      "http://localhost:5175",   
      "http://localhost:5174",
      "https://admin-glowbynjk.netlify.app",
      "https://glowbynjk001.netlify.app",
      "https://glowbynjk0001.netlify.app",
      
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // 👈 add PATCH & OPTIONS
    credentials: true,
  })
);




// ✅ Import all routes
const banners = require('./routes/adminBanner');
const offerRoutes = require('./routes/offerRoutes.js');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userLogin');
const userCartRoutes = require('./routes/cart.js');
const wishlistRoutes = require('./routes/userWishlist');
const blogRoutes = require('./routes/blog');
const productSliderRoutes = require('./routes/productSlider');
const VideocommerceRoutes = require('./routes/videocommerce.js');
const adminRoutes = require('./routes/adminLogin.js');
const promoRoutes = require('./routes/promo.js');
const addressRoutes = require('./routes/userAddress.js');
const smsUserRoutes = require('./routes/sendSMS.js');
const orderRoutes = require("./routes/orderRoutes.js");
const notificationRoutes = require('./routes/notificationRoutes.js');
const adminDashboard = require('./routes/adminDashboard.js');
const paymentRoutes = require("./routes/paymentRoutes");
const whatsappRoutes = require("./routes/whatsapp.js");
const metawhatsappRoutes = require("./routes/metaWhatsappRoutes.js");


app.use(cors())
app.use(morgan('dev'));
app.use(express.json({ limit: "2mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Static folder
// app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


// ✅ Socket.IO setup
 
const io = new Server(server, {   
 cors: {
 origin: [
       "https://www.glowbynjk.com",
      "https://glowbynjk.com",
      "https://admin.glowbynjk.com",
      "http://localhost:5173",   // React dev (Vite)
      "http://localhost:3000",   // React dev (CRA)
      "http://localhost:5175",
      "http://localhost:5174",
      "https://glowbynjk-test01.netlify.app",   // another local frontend
      "https://admin-glowbynjk.netlify.app",
      "https://glowbynjk001.netlify.app",  // live site
      "https://glowbynjk0001.netlify.app"
    ],    methods: ["GET", "POST"],
  },
});

// Make io globally accessible (or via req.app)
app.set("io", io);
io.on("connection", (socket) => {
  console.log("🟢 Admin dashboard connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Admin dashboard disconnected:", socket.id);
  });
});





// --- Mongoose Model ---
const subscriptionSchema = new mongoose.Schema({
   endpoint: { type: String, required: true },
    keys: {        
    p256dh: String,
    auth: String,
  },
});
const Subscription = mongoose.model("Subscriptionnotification", subscriptionSchema);

// 🔐 VAPID keys (generate once: npx web-push generate-vapid-keys)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  "mailto:glowbynjk@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);



// ✅ Save Subscription
app.post("/api/save-subscription", async (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ success: false });

  const exists = await Subscription.findOne({ endpoint: sub.endpoint });
  if (!exists) {
    await Subscription.create(sub);
    console.log("✅ Saved new subscription:", sub.endpoint);
  }
  res.json({ success: true });
});




app.post("/api/send-notification/path", async (req, res) => {
  try {
    const { title, message, url } = req.body;

    const payload = JSON.stringify({
      title: title,
      message: message,
      link: url || "/",
      icon: "https://glowbynjk-test01.netlify.app/assets/icon-notify-awcHFBSO.png",
    });

    const subs = await Subscription.find();
    if (!subs.length) {
      return res.json({ success: false, message: "No subscriptions found" });
    }

    const results = await Promise.allSettled(
      subs.map(async (subDoc) => {
        const sub = {
          endpoint: subDoc.endpoint,
          keys: {
            p256dh: subDoc.keys.p256dh,
            auth: subDoc.keys.auth,
          },
        };

        try {
          await webpush.sendNotification(sub, payload);
          console.log("✅ Notification sent to:", sub.endpoint);
        } catch (err) {
          console.error("❌ Push failed:", err.statusCode || err);

          // Remove expired or invalid subscriptions
          if (err.statusCode === 404 || err.statusCode === 410) {
            await Subscription.deleteOne({ _id: subDoc._id });
            console.warn("🧹 Removed invalid subscription:", sub.endpoint);
          }
        }
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.filter((r) => r.status === "rejected").length;

    res.json({
      success: true,
      total: subs.length,
      sent: successCount,
      failed: failCount,
    });
  } catch (err) {
    console.error("❌ Error sending notifications:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// ✅ API routes
app.use('/api', banners);
app.use('/api', offerRoutes);
app.use('/api', productRoutes);
app.use('/api', userRoutes);
app.use('/api', userCartRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', blogRoutes);
app.use('/api', productSliderRoutes);
app.use('/api', VideocommerceRoutes);
app.use('/api', adminRoutes);
app.use('/api', promoRoutes);
app.use('/api', addressRoutes);
app.use('/api', smsUserRoutes);
app.use('/api', orderRoutes);
app.use('/api', notificationRoutes);
app.use('/api', adminDashboard);
app.use('/api/payment', paymentRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api', metawhatsappRoutes);

// (async () => {
//   const browser = await puppeteer.launch({
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
// })();

// ✅ Optional root test route
app.get("/", (req, res) => {
  res.send("🚀 Glow by NJK API is running successfully!");
});

// ✅ Safe cron job loading
setTimeout(() => {
  try {
    require("./controller/orderController");
    console.log("✅ Cart reminder cron job loaded!");
  } catch (err) {
    console.error("❌ Failed to load cron job:", err);
  }
}, 5000);

// ✅ Start server   
server.listen(PORT, (err) => {  
  if (err) {
    console.error("❌ Server failed to start:", err);
  } else {
    console.log(`✅ Server running successfully on port ${PORT}`);
  }
});
