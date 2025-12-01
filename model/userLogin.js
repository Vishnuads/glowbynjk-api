const mongoose = require('mongoose')
const crypto = require("crypto");
const bcrypt = require("bcryptjs");



const userSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
     password:{
        type:String,
        required:true
    },
     rewardPoints: {
    type: Number,
    default: 0
  },
      giftCardCode: { type: String, default: null },  // 👈 added here
  reset_password_token: String,
  reset_password_expiration: Date,
},{timestamps:true})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// userSchema.methods.getResetPasswordToken = function () {
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 

//   return resetToken;
// };

module.exports = mongoose.model("User",userSchema)