const Wishlist = require('../model/userWishlist');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.json({ items: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Error fetching wishlist", error: err });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { items } = req.body; // expecting array of items
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (!wishlist) {
      // If no wishlist exists, create a new one with all items
      wishlist = new Wishlist({ userId: req.user.id, items });
    } else {
      // Check for duplicates by BOTH productId and netQuantity
      const newItems = items.filter((newItem) => {
        return !wishlist.items.some(
          (existingItem) =>
            existingItem.productId.toString() === newItem.productId.toString() &&
            existingItem.netQuantity === newItem.netQuantity
        );
      });

      wishlist.items.push(...newItems); // Add only non-duplicate variants
    }

    await wishlist.save();
    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ message: "Error adding to wishlist", error: err });
  }
};


const removeFromWishlist = async (req, res) => {
  try {
    const { productId, netQuantity } = req.params; // pass netQuantity in URL or query
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    // Remove the exact item by productId AND netQuantity
    wishlist.items = wishlist.items.filter(
      (i) =>
        i.productId.toString() !== productId.toString() ||
        i.netQuantity !== netQuantity
    );

    await wishlist.save();
    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ message: "Error removing item", error: err });
  }
};


const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { items: [] },
      { new: true }
    );
    res.json({ success: true, message: "Wishlist cleared" });
  } catch (err) {
    res.status(500).json({ message: "Error clearing wishlist", error: err });
  }
};

const removeMultiple = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.json({ message: "Wishlist not found" });

    wishlist.items = wishlist.items.filter(
      (item) => !ids.includes(item._id.toString())
    );

    await wishlist.save();
    res.json({ message: "Selected items removed", items: wishlist.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing selected items" });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, clearWishlist, removeMultiple };
