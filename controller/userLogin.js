const User = require('../model/userLogin')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer") ;
const crypto = require('crypto')
const Newsletter = require('../model/newsLetter')
require('dotenv').config();
const base64url = require("base64url");

// import {sendPasswordRestLink}  from '../utils/resetPassword'
// const {sendPasswordRestLink} = require('../utils/resetPassword')
// const
const wp = require("wordpress-hash-node");
const { google } = require("googleapis");
const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_USER = process.env.GMAIL_USER;

// OAuth2 setup
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const registerInsert = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ error: "Required field empty" });
    }

    // Check if email already exists
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(400).json({ error: "Email Already Exists" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      email,
      firstName,
      lastName,
      password,
    });

    // Generate token for the new user
    const userToken = jwt.sign(
      { email,id:newUser._id},
      process.env.SECRET_KEY,
    //   { expiresIn: "1h" } 
    );

    return res.status(200).json({ userToken,userEmail:newUser });
  } catch (error) {
    console.log("Insert error", error);
    return res.status(500).json({ error: "Server error" });
  }
};

//   const registerLogin = async (req,res) => {
//     try{
//  const {email,password} = req.body
//     if(!email || !password){
//         return res.status(400).json({error:"Required field empty"})
//     }
//     const userEmail = await User.findOne({email})
//     if(!userEmail){
//         return res.status(400).json({error:"Email not exists"})
//     }
//     const userPass = await bcrypt.compare(password.trim(), userEmail.password);
//     if(!userPass){
//         return res.status(400).json({error:'Password not valid'})
//     }
//     if(userEmail && userPass){
//         const userToken = await jwt.sign({email,id:userEmail._id},process.env.SECRET_KEY)
//         // return res.header('auth',userToken).json(userToken)
//         return res.status(200).json({userToken,userEmail})
//     }
//     }catch(error){
//        return res.status(400).json({error:'error'})
//     }
//   }



// const registerLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Required field empty" });
//     }

//     const userEmail = await User.findOne({ email });
//     if (!userEmail) {
//       return res.status(400).json({ error: "Email not exists" });
//     }

//     let validPassword = false;

//     // Bcrypt?
//     if (/^\$2[aby]\$/.test(userEmail.password)) {
//       validPassword = await bcrypt.compare(password.trim(), userEmail.password);
//     }
//     // PHPass ($P$ prefix)
//     else if (/^\$P\$/.test(userEmail.password)) {
//       validPassword = wp.CheckPassword(password.trim(), userEmail.password);

//       if (validPassword) {
//         // ✅ migrate PHPass -> bcrypt
//         const newHash = await bcrypt.hash(password.trim(), 10);
//         userEmail.password = newHash;
//         await userEmail.save();
//       }
//     }

//     if (!validPassword) {
//       return res.status(400).json({ error: "Password not valid" });
//     }

//     const userToken = jwt.sign(
//       { email, id: userEmail._id },
//       process.env.SECRET_KEY
//     );

//     return res.status(200).json({ userToken, userEmail });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({ error: "Server error" });
//   }
// };









// const registerLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: "Required fields missing." });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: "Email does not exist." });
//     }

//     let validPassword = false;

//     // ✅ Case 1: bcrypt password
//     if (/^\$2[aby]\$/.test(user.password)) {
//       validPassword = await bcrypt.compare(password.trim(), user.password);
//     }

//     // ✅ Case 2: WordPress password check only (no update)
//     else if (/^\$P\$/.test(user.password)) {
//       validPassword = wp.CheckPassword(password.trim(), user.password);
//       if (validPassword) {
//         return res.status(400).json({
//           message: "WordPress account detected. Please update your password for security reasons.",
//           requirePasswordUpdate: true,
//         });
//       }
//     }

//     if (!validPassword) {
//       return res.status(400).json({ error: "Invalid password." });
//     }

//     // ✅ Normal login for bcrypt users
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.SECRET_KEY,
//       { expiresIn: "7d" }
//     );

//     return res.status(200).json({
//       token,
//       user,
//       message: "Login successful",
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({ error: "Server error, please try again later." });
//   }
// };





const registerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Required fields missing." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email does not exist." });
    }

    let validPassword = false;

    // ✅ Case 1: bcrypt password (normal login)
    if (/^\$2[aby]\$/.test(user.password)) {
      validPassword = await bcrypt.compare(password.trim(), user.password);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid password." });
      }

      // ✅ Generate JWT token for bcrypt users
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.SECRET_KEY,
        // { expiresIn: "7d" }
      );

      return res.status(200).json({
        token,
        user,
        message: "Login successful",
      });
    }

    // ✅ Case 2: WordPress password ($P$... format)
    if (/^\$P\$/.test(user.password)) {
      // Always display the security update message (no password check)
      return res.status(400).json({
        message: "For security reasons, your password has been updated. Please log in again.",
        requirePasswordUpdate: true,
      });
    }

    // ❌ Other unknown formats
    return res.status(400).json({ error: "Invalid password format." });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
};





const updateWordPressPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email not found." });
    }

    // Only allow update if it's a WordPress password
    if (!/^\$P\$/.test(user.password)) {
      return res.status(400).json({ error: "Password already updated or not WordPress format." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
};










const registerGetAll = async (req,res) =>{
   try{
     const getAll = await User.find().select(['-password']).sort({ createdAt: -1 });
     return res.status(200).json(getAll)
   }catch(error){
    return res.status(400).json({message:'getall error'})
   }
}


// Nodemailer setup
const mail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



// const forgetPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
//       expiresIn: "5m",
//     });

//     user.reset_password_token = token;
//     user.reset_password_expiration = Date.now() + 5 * 60 * 1000; // 5 min
//     await user.save();
    
//     const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${token}`;
//   // Create Gmail API client
//     const gmail = google.gmail({ version: "v1", auth: oAuth2Client });



//   const htmlBody= `
//     <div style="font-family: Arial, sans-serif; background-color: #f5f6fa; padding: 20px;">
//       <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
//         <!-- Header -->
//         <div style="background: #1d2b53; color: #ffffff; padding: 20px; text-align: center;">
//           <h2 style="margin: 0; font-size: 20px;">Password Reset Request</h2>
//         </div>

//         <!-- Body -->
//         <div style="padding: 20px; color: #333333; font-size: 14px; line-height: 1.6;">
//           <p>Hi <strong>${user.firstName}</strong>,</p>
//           <p>Someone has requested a new password for the following account on <strong>Glow by NJK</strong>:</p>
//           <p><strong>Username:</strong> ${user.firstName}</p>
//           <p>If you didn't make this request, just ignore this email. If you'd like to proceed:</p>
          
//           <p style="text-align: center; margin: 25px 0;">
//             <a href="${resetUrl}" 
//                style="background: #1d2b53; color: #ffffff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
//                Click here to reset your password
//             </a>
//           </p>

//           <p>This link will expire in <strong>5 minutes</strong>.</p>
//           <p>Thanks for reading.</p>
//         </div>

//         <!-- Footer -->
//         <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
//           Glow by NJK — Built with NJKPHARMA
//         </div>

//       </div>
//     </div>
//   `;

//    // Build email message
//     const messageParts = [
//       `From: GlowByNJK <${GMAIL_USER}>`,
//       `To: ${user.email}`,
//       "Subject: Password Reset Request",
//       "MIME-Version: 1.0",
//       "Content-Type: text/html; charset=utf-8",
//       "",
//       htmlBody,
//     ];

//      const message = messageParts.join("\n");
//     const encodedMessage = base64url(message);

//     // Send using Gmail API
//     await gmail.users.messages.send({
//       userId: "me",
//       requestBody: { raw: encodedMessage },
//     });


//     return res.json({ message: "Password reset link sent to your email" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }



const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "5m",
    });

    user.reset_password_token = token;
    user.reset_password_expiration = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();
    
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${token}`;

   await mail.sendMail({
  from: `"Glow by NJK" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: "Password Reset Request",
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f5f6fa; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: #1d2b53; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Password Reset Request</h2>
        </div>

        <!-- Body -->
        <div style="padding: 20px; color: #333333; font-size: 14px; line-height: 1.6;">
          <p>Hi <strong>${user.firstName}</strong>,</p>
          <p>Someone has requested a new password for the following account on <strong>Glow by NJK</strong>:</p>
          <p><strong>Username:</strong> ${user.firstName}</p>
          <p>If you didn't make this request, just ignore this email. If you'd like to proceed:</p>
          
          <p style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" 
               style="background: #1d2b53; color: #ffffff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
               Click here to reset your password
            </a>
          </p>

          <p>This link will expire in <strong>5 minutes</strong>.</p>
          <p>Thanks for reading.</p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          Glow by NJK — Built with NJKPHARMA
        </div>

      </div>
    </div>
  `,
});


    return res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


const resetPassword = async (req,res) => {
try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Password required" });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({
      _id: decoded.userId,
      reset_password_token: token,
      reset_password_expiration: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password; // will be hashed by pre-save hook
    user.reset_password_token = undefined;
    user.reset_password_expiration = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
}



const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Update name/email safely
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: "Email already taken" });
      user.email = email;
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    // ✅ Only change password if user typed both current & new password
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Both current and new password are required" });
      }

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ error: "Current password is wrong" });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({ error: "New password cannot be same as current password" });
      }

      const hashedPassword = newPassword;
      user.password = hashedPassword;
    }

    await user.save();

    // ✅ Never send hashed password back to frontend
    const safeUser = { ...user._doc, password: undefined };

    res.json({ message: "Account updated successfully", user: safeUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


const userGetId = async (req, res) => {
  try {
    // decoded.id contains the MongoDB _id of the user
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("User fetch error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


const userDelete =  async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// POST /api/auth/forgot-password
// Create a test account or replace with real credentials.
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// Wrap in an async IIFE so we can use await.
// (async () => {
//   const info = await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_USER,
//     subject: "Hello ✔",
//     text: "Hello world?", 
//     html: "<b>Hello world?</b>", 
//   });

//   console.log("Message sent:", info.messageId);
// })();

// const forgetPassword = async (req,res, next) => {
//   try{
//      const { email } = req.body;
//  if(!email){
//   return res.status(400).json({message:"Email is required"})
//  }
//     const user = await User.findOne({ email });
//     if (!user){
//   return res.status(404).json({ message: "User not found" });
//     }
//     const token = jwt.sign({userId : user._id}, process.env.SECRET_KEY,{
//       expiresIn : 300,
//     });
//     const date = new Date();
//     const newMinutes = date.getMinutes() + 5;
//     date.setMinutes(newMinutes)
//     user.reset_password_token = token
//     user.reset_password_expiration = date
//     await user.save()

//     const verificationEmailResponse = await sendPasswordRestLink (email,token, user.name)
//   }catch(error){
//     return res.status(400).json({message:'Server error'})
//   }

// }





// Forgot Password
// const forgetPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     const resetToken = user.getResetPasswordToken();
//     await user.save();

//     const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//     });

//     await transporter.sendMail({
//       to: user.email,
//       subject: "Password Reset Request",
//       html: `<p>You requested to reset your password.</p>
//              <a href="${resetUrl}">Click here to reset</a>`,
//     });

//     res.json({ msg: "Email sent successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };

// Reset Password
// const resetPassword =  async (req, res) => {
//   const resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   try {
//     const user = await User.findOne({
//       resetPasswordToken,
//       resetPasswordExpire: { $gt: Date.now() }
//     });

//     if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

//     user.password = req.body.password; 
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save();

//     res.json({ msg: "Password updated successfully" });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// };




// const resetPassword = async (req,res,next) => {

// }
const updateGiftCard = async (req, res) => {
  try {
    const { giftCardCode } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { giftCardCode },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Gift card updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating gift card" });
  }
};

// controllers/userController.js
const deleteGiftCard = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $unset: { giftCardCode: "" } }, // remove gift card only
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Gift card deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error deleting gift card" });
  }
};

//newsletter




// const newsletter = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email)
//       return res.status(400).json({ message: "Email is required" });

//     // Check existing
//     const existing = await Newsletter.findOne({ email });
//     if (existing)
//       return res.json({ message: "You are already subscribed!" });

//     // Save new
//     const newSub = new Newsletter({ email });
//     await newSub.save();

//     // Gmail API send
//     const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

//     const htmlBody = `
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;font-family:Arial,Helvetica,sans-serif;">
//       <tr>
//         <td align="center">
//           <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">
//             <tr>
//               <td style="background:#111827;padding:30px;text-align:center;">
//                 <h1 style="margin:0;font-size:26px;color:#ffffff;font-weight:600;">✨ Welcome to GlowByNjk ✨</h1>
//                 <p style="margin:8px 0 0 0;color:#d1d5db;font-size:14px;">Beauty • Style • Glow</p>
//               </td>
//             </tr>
//             <tr>
//               <td style="padding:35px;text-align:left;">
//                 <h2 style="margin:0 0 15px 0;font-size:22px;color:#111827;">We’re excited to have you!</h2>
//                 <p style="margin:0 0 16px 0;color:#4b5563;font-size:15px;line-height:1.6;">
//                   Thank you for joining our Glow Updates family 💖.
//                   From now on, you’ll receive <b>exclusive offers</b>, <b>early access to new launches</b>,
//                   and the latest <b>beauty inspirations</b> — straight to your inbox.
//                 </p>
//                 <table role="presentation" cellpadding="0" cellspacing="0" style="margin:25px 0;">
//                   <tr>
//                     <td align="center">
//                       <a href="${process.env.SITE_URL}" target="_blank" 
//                         style="background:#ec4899;border-radius:6px;color:#ffffff;padding:14px 26px;
//                         display:inline-block;text-decoration:none;font-weight:bold;font-size:15px;">
//                         🌸 Explore Now
//                       </a>
//                     </td>
//                   </tr>
//                 </table>
//                 <p style="margin:0;color:#6b7280;font-size:13px;">
//                   Stay tuned — glowing surprises are on the way ✨
//                 </p>
//               </td>
//             </tr>
//             <tr>
//               <td style="padding:20px;text-align:center;background:#f9fafb;border-top:1px solid #e5e7eb;">
//                 <p style="margin:0;font-size:12px;color:#9ca3af;">
//                   © ${new Date().getFullYear()} GlowByNjk. All rights reserved.
//                 </p>
//               </td>
//             </tr>
//           </table>
//         </td>
//       </tr>
//     </table>`;

//     // Prepare Gmail API message
//     const messageParts = [
//       `From: GlowByNJK <${GMAIL_USER}>`,
//       `To: ${email}`,
//       "Subject: Welcome to Glow Updates",
//       "MIME-Version: 1.0",
//       "Content-Type: text/html; charset=utf-8",
//       "",
//       htmlBody,
//     ];

//     const message = messageParts.join("\n");
//     const encodedMessage = base64url(message);

//     // Send email via Gmail API
//     await gmail.users.messages.send({
//       userId: "me",
//       requestBody: { raw: encodedMessage },
//     });

//     res.json({
//       message: "Subscription successful! Check your email for confirmation.",
//     });
//   } catch (err) {
//     console.error("Email error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


 const newsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Save in DB
    const existing = await Newsletter.findOne({ email });
    if (existing) return res.json({ message: "You are already subscribed!" });

    const newSub = new Newsletter({ email });
    await newSub.save();

    // Send confirmation email (optional)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Welcome to Glow Updates ✨",
  html: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;font-family:Arial,Helvetica,sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:30px;text-align:center;">
              <h1 style="margin:0;font-size:26px;color:#ffffff;font-weight:600;">✨ Welcome to GlowByNjk ✨</h1>
              <p style="margin:8px 0 0 0;color:#d1d5db;font-size:14px;">Beauty • Style • Glow</p>
            </td>
          </tr>

          <!-- Hero / Message -->
          <tr>
            <td style="padding:35px;text-align:left;">
              <h2 style="margin:0 0 15px 0;font-size:22px;color:#111827;">We’re excited to have you!</h2>
              <p style="margin:0 0 16px 0;color:#4b5563;font-size:15px;line-height:1.6;font-family: 'Work Sans',sans-serif;">
                Thank you for joining our Glow Updates family 💖. 
                From now on, you’ll receive <b>exclusive offers</b>, <b>early access to new launches</b>, 
                and the latest <b>beauty inspirations</b> — straight to your inbox.
              </p>
  
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.SITE_URL}" target="_blank" 
                      style="background:#ec4899;border-radius:6px;color:#ffffff;padding:14px 26px;
                      display:inline-block;text-decoration:none;font-weight:bold;font-size:15px;">
                      🌸 Explore Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6b7280;font-size:13px;">
                Stay tuned — glowing surprises are on the way ✨
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px;text-align:center;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} GlowByNjk. All rights reserved.<br>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `,
});



    res.json({ message: "Subscription successful! Check your email for confirmation." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// const sendNewsletter = async (req, res) => {
//   const { subject, message, buttonText } = req.body;
//   if (!subject || !message || !buttonText)
//     return res.status(400).json({ message: "Subject and message required" });
//   try {
//     const users = await Newsletter.find();
//     if (!users.length) return res.status(404).json({ message: "No subscribers found" });

//     const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
//  // Prepare styled HTML
//     const styledMessage = `
//       <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#f9f9f9;">
//         <h2 style="color:#1d2b53; text-align:center;">🌟 ${subject} 🌟</h2>
//         <p style="font-size:16px; text-align:center; color:#333;">${message}</p>
//          <div style="text-align:center; margin:20px 0;">
//     <a href=${process.env.CLIENT_URL} style="display:inline-block; padding:10px 20px; background-color:#1d2b53; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">
//       ${buttonText || "Learn More"}
//     </a>
//   </div>
//         <hr style="border:0; border-top:1px solid #eee; margin:20px 0;" />
//         <p style="font-size:12px; color:#999; text-align:center;">
//           You received this email because you subscribed to our newsletter.<br/>
//         </p>
//       </div>
//     `;
//     const sendEmailPromises = users.map(async (user) => {
//       const emailLines = [
//         `From: GlowByNJK <${process.env.GMAIL_USER}>`,
//         `To: ${user.email}`,
//         `Subject: ${subject}`,
//         "Content-Type: text/html; charset=UTF-8",
//         "",
//         styledMessage,
//       ];

//       const encodedMessage = Buffer.from(emailLines.join("\n"))
//         .toString("base64")
//         .replace(/\+/g, "-")
//         .replace(/\//g, "_")
//         .replace(/=+$/, "");

//       await gmail.users.messages.send({
//         userId: "me",
//         requestBody: { raw: encodedMessage },
//       });
//     });

//     await Promise.all(sendEmailPromises);

//     res.json({ message: `Newsletter sent to ${users.length} users !` });
//   } catch (err) {
//     console.error("Gmail API error:", err);
//     res.status(500).json({ message: "Failed to send newsletter", error: err.message });
//   }
// };



 const sendNewsletter = async (req, res) => {
  const { subject, message, buttonText } = req.body;
  if (!subject || !message || !buttonText)
    return res.status(400).json({ message: "Subject, message, and button text are required" });

  try {
    // Get all subscribers
    const users = await Newsletter.find();
    if (!users.length)
      return res.status(404).json({ message: "No subscribers found" });

    // ✅ Create transporter (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g. your Gmail or Workspace address
        pass: process.env.EMAIL_PASS, // App Password (not your Gmail login)
      },
    });

    // ✅ Prepare styled HTML
    const styledMessage = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#f9f9f9;">
        <h2 style="color:#1d2b53; text-align:center;">🌟 ${subject} 🌟</h2>
        <p style="font-size:16px; text-align:center; color:#333;">${message}</p>
        <div style="text-align:center; margin:20px 0;">
          <a href="${process.env.CLIENT_URL}" style="display:inline-block; padding:10px 20px; background-color:#1d2b53; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">
            ${buttonText || "Learn More"}
          </a>
        </div>
        <hr style="border:0; border-top:1px solid #eee; margin:20px 0;" />
        <p style="font-size:12px; color:#999; text-align:center;">
          You received this email because you subscribed to our newsletter.<br/>
        </p>
      </div>
    `;

    // ✅ Send emails one by one (to avoid Gmail rate limit)
    for (const user of users) {
      await transporter.sendMail({
        from: `GlowByNJK <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: styledMessage,
      });
    }

    res.json({ message: `Newsletter sent to ${users.length} users!` });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ message: "Failed to send newsletter", error: err.message });
  }
};


const newsletterGet = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

const newsletterDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Newsletter.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Subscriber not found" });
    res.json({ message: "Subscriber deleted successfully", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


module.exports = {sendNewsletter,updateWordPressPassword,newsletterDelete,newsletterGet,newsletter,deleteGiftCard,updateGiftCard,userGetId,registerInsert,registerLogin,registerGetAll,forgetPassword,resetPassword, updateUser, userDelete}
