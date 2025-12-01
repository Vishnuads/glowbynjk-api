const Address = require("../model/userAddress");
const Cart = require("../model/cart")

// get addresses for user
const addressGet = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) return res.status(403).json({ message: "Forbidden" });

    const doc = await Address.findOne({ userId: id });
    if (!doc) return res.json({}); // no addresses yet
    res.json({
      billing: doc.billing,
      shipping: doc.shipping,
      shipToDifferentAddress: doc.shipToDifferentAddress,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// create or update addresses
// const createAddress = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (req.user.id !== id) return res.status(403).json({ message: "Forbidden" });
//     const { billing, shipping, shipToDifferentAddress } = req.body;
//     let doc = await Address.findOne({ userId: id });
//     if (!doc) {
//       doc = new Address({
//         userId: id,
//         billing,
//         shipping,
//         shipToDifferentAddress: !!shipToDifferentAddress,
//       });
//     } else {
//       doc.billing = billing;
//       doc.shipping = shipping;
//       doc.shipToDifferentAddress = !!shipToDifferentAddress;
//     }
//     await doc.save();
//     res.json({ message: "Saved" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const createAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) return res.status(403).json({ message: "Forbidden" });

    const { billing, shipping, shipToDifferentAddress } = req.body;

    let doc = await Address.findOne({ userId: id });

    if (!doc) {
      doc = new Address({
        userId: id,
        billing,
        shipping,
        shipToDifferentAddress: !!shipToDifferentAddress,
      });
    } else {
      doc.billing = billing;
      doc.shipping = shipping;
      doc.shipToDifferentAddress = !!shipToDifferentAddress;
    }

    await doc.save();


     // 🟢 Update user cart phone & email automatically
    const phone = billing?.phone || "";
    const email = billing?.email || "";

    await Cart.findOneAndUpdate(
      { userId: id  },
      { $set: { phone, email } },
      { new: true }
    );



    // ✅ Return the full saved document
    res.status(201).json({
      message: "Saved",
      address: doc, // <-- this contains _id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// merge endpoint: merges guest data into user's addresses (you can decide merge policy)
const mergeAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) return res.status(403).json({ message: "Forbidden" });
    const { billing, shipping, shipToDifferentAddress } = req.body;

    let doc = await Address.findOne({ userId: id });
    if (!doc) {
      doc = new Address({
        userId: id,
        billing,
        shipping,
        shipToDifferentAddress: !!shipToDifferentAddress,
      });
    } else {
      // merge policy: prefer existing DB values, fall back to guest values
      doc.billing = { ...billing, ...doc.billing }; // guest values first then existing: adjust as needed
      if (shipping) doc.shipping = { ...shipping, ...doc.shipping };
      doc.shipToDifferentAddress = !!shipToDifferentAddress;
    }
    await doc.save();
    res.json({ message: "Merged" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
    addressGet,
    createAddress,
    mergeAddress
}
