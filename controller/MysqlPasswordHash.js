import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = "mongodb://localhost:27017/glowbynjk"; // same DB you imported into
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model("users", userSchema, "users"); 
// 🔑 third param ensures it uses the admin_user collection

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({});
    console.log(`Found ${users.length} users in admin_user collection`);

    for (const user of users) {
      const pwd = user.password;
      const userLabel = `${user._id} ${user.username || user.email || ''}`;

      if (!pwd || typeof pwd !== "string") {
        console.log(`Skipping ${userLabel} — no password field or not a string`);
        continue;
      }

      if (/^\$2[aby]\$/.test(pwd)) {
        console.log(`Already hashed: ${userLabel}`);
        continue;
      }

      const hashed = bcrypt.hashSync(pwd, SALT_ROUNDS);

      // Save hashed password
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashed } }
      );

      console.log(`✅ Stored hashed password for ${userLabel}`);
    }

    await mongoose.disconnect();
    console.log("🔒 Done!");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
