import PDFDocument from "pdfkit-table";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

export const generateInvoicePDF = async (order) => {
  const invoicesDir = path.resolve("invoices");
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

  const filePath = path.join(invoicesDir, `invoice_${order.invoiceNumber || order.orderNumber}.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const primaryColor = "#000000";

  // === Header ===
// try {
//   const logoPath = path.join(__dirname, "../logo/logo.jpg");
//   console.log("Exists:", fs.existsSync(logoPath));

//   if (fs.existsSync(logoPath)) {
//     doc.image(logoPath, 50, 50, { width: 100 });
//   } else {
//     doc.text("Logo not found!");
//   }
// } catch (err) {
//   console.error("Error adding logo:", err);
// }
// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve logo path
const logoPath = path.join(__dirname, '../logo/glow_log.png');
console.log("Resolved path:", logoPath);
console.log("Exists:", fs.existsSync(logoPath));

// Add logo
try {
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 30, { width: 100 });
  } else {
    doc.text("Logo not found!");
  }
} catch (err) {
  console.error("Error adding logo:", err);
}

  doc.font("Helvetica-Bold").fontSize(12).fillColor(primaryColor).text("NJK Pharmacy Pvt Ltd", 200, 30, { align: "right" });
  doc.font("Helvetica").fontSize(10);
  doc.text("NJK House, No. 2A, 7th Main Road,", { align: "right" });
  doc.text("New Colony, Chromepet,", { align: "right" });
  doc.text("Chennai - 600044, India.", { align: "right" });

  doc.moveDown(2);
  doc.fontSize(18).font("Helvetica-Bold").text("INVOICE", 40, 100);
  doc.moveDown(1);

  // === Bill To / Ship To ===
  // const billing = order.addressId?.billing || order.guestAddress.billing;
  // const shipping = order.addressId?.shipping || billing;

//  const billing = order?.billing || {};
// const shipping = order?.shipping || billing;

// Determine billing and shipping
const billing = order.billing || order.guestAddress?.billing || {};
let shipping = order.shipping || order.guestAddress?.shipping || {};

// If shipping is empty, use billing
if (!shipping.firstName && !shipping.lastName) {
  shipping = billing;
}

  const billingText = `${billing.firstName || ""} ${billing.lastName || ""}
${billing.companyName || ""}
${billing.streetAddress || ""} ${billing.apartment || ""}
${billing.city || ""}, ${billing.state || ""} ${billing.pincode || ""}
Email: ${billing.email || ""}
Phone: ${billing.phone || ""}`;

  const shippingText = `${shipping.firstName || ""} ${shipping.lastName || ""}
${shipping.companyName || ""}
${shipping.streetAddress || ""}, ${shipping.apartment || ""}
${shipping.city || ""}, ${shipping.state || ""} ${shipping.pincode || ""}`;

  doc.fontSize(10).font("Helvetica-Bold").text("Bill To:", 40, 130);
  doc.text("Ship To:", 300, 130);
  doc.font("Helvetica").text(billingText, 40, 145, { width: 220 });
  doc.text(shippingText, 300, 145, { width: 220 });

  // === Invoice Info ===
  doc.moveDown(4);
  const infoY = doc.y;
  doc.font("Helvetica-Bold");
  doc.text("Invoice Number:", 40, infoY);
  doc.text("Invoice Date:", 40, infoY + 14);
  doc.text("Order Number:", 40, infoY + 28);
  doc.text("Order Date:", 40, infoY + 42);
  doc.text("Payment Method:", 40, infoY + 56);

  doc.font("Helvetica");
  doc.text(order.invoiceNumber || "-", 160, infoY);
  doc.text(new Date(order.createdAt).toLocaleDateString(), 160, infoY + 14);
  doc.text(order.orderNumber || "-", 160, infoY + 28);
  doc.text(new Date(order.createdAt).toLocaleDateString(), 160, infoY + 42);
  doc.text(order.paymentMethod || "N/A", 160, infoY + 56);

  // === Table Data ===
  const table = {
    headers: [
      { label: "Product", property: "product", width: 270, headerColor: primaryColor, headerOpacity: 1, align: "center" },
      { label: "Quantity", property: "quantity", width: 120, headerColor: primaryColor, headerOpacity: 1, align: "center" },
      { label: "Price ", property: "price", width: 110, headerColor: primaryColor, headerOpacity: 1, align: "center" },
    ],
    datas: order.cartItems.map((i) => ({
      product: i.title || i.product,
      quantity: i.quantity,
      price: i.price.toFixed(2),
    })),
  };

  await doc.table(table, {
  prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10).fillColor("#FFFFFF"),
  prepareRow: (row, i) => doc.font("Helvetica").fontSize(9).fillColor("#000000"),
  divider: {
    header: { disabled: false, width: 1, opacity: 1 },
    horizontal: { disabled: false, width: 0.5, opacity: 0.3 },
  },
  padding: 4,       // smaller padding
  x: 50,
  y: doc.y + 20,    // less vertical gap
  options: { width: 450 }, // match sum of column widths
  headerBackground: primaryColor,
  headerTextColor: "#FFFFFF",
});


  // === Totals ===
  const subtotal = order.cartItems.reduce((s, i) => s + i.quantity * i.price, 0);
  const discount = Number(order.discountAmount) || 0;
  const giftUsed = Number(order.giftUsedAmount) || 0;
  const reward = Number(order.rewardPoints) || 0;
  const total = subtotal - discount - giftUsed - reward;

  doc.moveDown(1);
  doc.font("Helvetica").fontSize(10);
  doc.text(`Subtotal: ${subtotal.toFixed(2)}`, { align: "right" });
  if (discount > 0) doc.text(`Discount: ${discount.toFixed(2)}`, { align: "right" });
  if (giftUsed > 0) doc.text(`Gift Used: ${giftUsed.toFixed(2)}`, { align: "right" });
  if (reward > 0) doc.text(`Reward Points: ${reward.toFixed(2)}`, { align: "right" });
  doc.text(`Shipping: Free shipping`, { align: "right" });

  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(11).text(`Total: INR ${total.toFixed(2)}`, { align: "right" });

  // === Footer ===
  doc.moveTo(40, 780).lineTo(550, 780).strokeColor("#000").stroke();
  doc.fontSize(9);
  doc.text("www.glowbynjk.com", 40, 790);
  doc.text("support@glowbynjk.com", 420, 790, { align: "right" });

  doc.end();

  return new Promise((resolve) => stream.on("finish", () => resolve(filePath)));
};
