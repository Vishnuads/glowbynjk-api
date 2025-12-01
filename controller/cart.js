const Cart = require('../model/cart.js');
const User = require("../model/userLogin.js");
const mongoose = require('mongoose')
const Address = require('../model/userAddress.js')





//original

// const userCartPost = async (req, res) => {
//   const userId = req.user.id || req.user._id;
//   const cartItems = req.body.cartItems || req.body.items || [];
//   const replace = req.body.replace || false;

//   try {
//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({ userId, items: cartItems });
//       await cart.save();
//       return res.json({ success: true, cart });
//     }

//     if (replace) {
//       cart.items = cartItems;
//       await cart.save();
//       return res.json({ success: true, cart, replaced: true });
//     }

//     // Merge: match by product id + netQuantity
//     cartItems.forEach((newItem) => {
//       const newId = String(newItem._id);
//       const newNet = String(newItem.netQuantity ?? "");

//       const existingIndex = cart.items.findIndex(existing => {
//         const existId = String(existing._id);
//         const existNet = String(existing.netQuantity ?? "");
//         return existId === newId && existNet === newNet;
//       });

//       if (existingIndex > -1) {
//         // Add quantities
//         cart.items[existingIndex].quantity = (cart.items[existingIndex].quantity || 0) + (newItem.quantity || 0);
//         // Optionally update price if you want latest:
//         // cart.items[existingIndex].prices = newItem.prices || cart.items[existingIndex].prices;
//       } else {
//         cart.items.push(newItem);
//       }
//     });

//     await cart.save();
//     return res.json({ success: true, cart, merged: true });
//   } catch (err) {
//     console.error("Error saving cart:", err);
//     return res.status(500).json({ error: "Failed to save cart" });
//   }
// };


const userCartPost = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const cartItems = req.body.cartItems || req.body.items || [];
  const replace = req.body.replace || false;

  try {
    // 1️⃣ Fetch address for user
    const address = await Address.findOne({ userId });

    // 2️⃣ Extract phone + email (prefer billing first)
    const phone = address?.billing?.phone || "";
    const email = address?.billing?.email || "";

    // 3️⃣ Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: cartItems,
        phone,
        email,
      });
      await cart.save();
      return res.json({ success: true, cart });
    }

    // 4️⃣ Replace cart items
    if (replace) {
      cart.items = cartItems;
      cart.phone = phone;
      cart.email = email;
      await cart.save();
      return res.json({ success: true, cart, replaced: true });
    }

    // 5️⃣ Merge existing items
    cartItems.forEach((newItem) => {
      const newId = String(newItem._id);
      const newNet = String(newItem.netQuantity ?? "");

      const existingIndex = cart.items.findIndex((existing) => {
        const existId = String(existing._id);
        const existNet = String(existing.netQuantity ?? "");
        return existId === newId && existNet === newNet;
      });

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity =
          (cart.items[existingIndex].quantity || 0) +
          (newItem.quantity || 0);
      } else {
        cart.items.push(newItem);
      }
    });

    // 6️⃣ Always update contact info in case user updated address later
    cart.phone = phone;
    cart.email = email;

    await cart.save();
    return res.json({ success: true, cart, merged: true });
  } catch (err) {
    console.error("Error saving cart:", err);
    return res.status(500).json({ error: "Failed to save cart" });
  }
};


//videocommerceaddtocart


// POST /api/user/cart
// POST /user/cart/videocommerce
const videoCommercePost = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const cartItems = req.body.cartItems || [];
  const replace = req.body.replace || false;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    if (replace) {
      cart.items = cartItems;
      await cart.save();
      return res.json({ success: true, cart, replaced: true });
    }

    // Merge by productName
    cartItems.forEach((newItem) => {
      const index = cart.items.findIndex(item => item.productName === newItem.productName);

      if (index > -1) {
        cart.items[index].quantity = (cart.items[index].quantity || 0) + (newItem.quantity || 1);
        // Update latest variant info
        cart.items[index].prices = newItem.prices || cart.items[index].prices;
        cart.items[index].netQuantity = newItem.netQuantity || cart.items[index].netQuantity;
        cart.items[index].images = newItem.images || cart.items[index].images;
        cart.items[index].title = newItem.title || cart.items[index].title;
      } else {
        cart.items.push({
          productName: newItem.productName,
          title: newItem.title,
          images: newItem.images || [],
          netQuantity: newItem.netQuantity || null,
          prices: newItem.prices || null,
          quantity: newItem.quantity || 1,
        });
      }
    });

    await cart.save();
    return res.json({ success: true, cart, merged: true });
  } catch (err) {
    console.error("Error saving cart:", err);
    return res.status(500).json({ error: "Failed to save cart" });
  }
};





// ✅ Replace or update cart completely
const userCartPut = async (req, res) => {
  const userId = req.user.id;
  const cartItems = req.body.cartItems;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // No cart exists → create new one with provided items
      cart = new Cart({ userId, items: cartItems });
    } else {
      // Replace entire cart
      cart.items = cartItems;
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update cart" });
  }
};

// ✅ Delete a single item from cart original//
// const userCartDelete = async (req, res) => {
//   const userId = req.user.id;
//   const itemId = req.params.itemId; 

//   try {
//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       return res.status(404).json({ error: "Cart not found" });
//     }

//     cart.items = cart.items.filter(item => item._id.toString() !== itemId);

//     await cart.save();
//     res.json({ success: true, cart });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to delete item from cart" });
//   }
// };



const userCartDelete = async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.itemId; // pass itemId in URL like /api/user/cart/:itemId

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);


       // 🧹 If cart becomes empty, clear contact info
    if (cart.items.length === 0) {
      cart.phone = "";
      cart.email = "";
    }


    
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
};


// Get user cart
const userCartGet = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(cart ? cart.items : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};





const deleteUserCart = async (req, res) => {
  try {
    // ✅ Always use _id from verifyToken
    const userId = req.user._id;
    console.log("Clearing cart for userId:", userId);
    // ✅ Atomic update
    const result = await Cart.updateOne(
      { userId },
      { $set: { items: [] } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // ✅ Fetch updated cart to confirm
    const emptyCart = await Cart.findOne({ userId });

    res.json({
      success: true,
      message: "All items removed from cart",
      cart: emptyCart
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};



module.exports = { userCartPost, userCartGet, userCartPut, userCartDelete, deleteUserCart,videoCommercePost };
