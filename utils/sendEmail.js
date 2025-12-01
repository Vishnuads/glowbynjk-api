const nodemailer = require("nodemailer");
const { generateInvoicePDF } = require("./invoiceGenerator");
const Address = require('../model/userAddress')


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


const sendOrderEmail = async (to, order) => {
  
// Example: Fetch address document if order has addressId
let firstName = '';
let lastName = '';

if (order.addressId) {
  const address = await Address.findById(order.addressId); // fetch from DB
  if (address) {
    firstName = address.billing?.firstName;
    lastName = address.billing?.lastName;
  }
} else if (order.guestAddress?.billing) {
  firstName = order.guestAddress.billing?.firstName;
  lastName = order.guestAddress.billing?.lastName;
}
        
// Fallback
if (!firstName) firstName = 'Customer';

  const pdfPath = await generateInvoicePDF(order);

  const mailOptions = {
    from: `"GlowByNjk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Order #${order.orderNumber} Confirmation`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background: #f4f4f4; padding: 30px 0;">
        <div style="max-width: 650px; margin: auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: #2a9d8f; padding: 20px; color: #fff; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Thank You for Your Order!</h1>
          </div>
          
          <!-- Body -->
          <div style="padding: 20px;">
            <p style="font-size: 16px;">
                Hi ${firstName} ${lastName},
            </p>
            <p>Your order has been successfully placed. Here are the details:</p>
            
            <!-- Order Summary Table -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Order Number:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Invoice Number:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${order.invoiceNumber}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><b>Total Amount:</b></td>
                <td style="padding: 10px; border: 1px solid #ddd;">₹${order.totalAmount}</td>
              </tr>
            </table>

            <!-- Products -->
            <h3 style="margin-top: 25px;">Your Items:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  ${order.cartItems.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <!-- Product Info -->
      <td style="padding: 10px; vertical-align: top;">
        <p style="margin: 0; font-weight: bold; font-size: 16px;">${item.title}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #555;">Quantity: <strong>${item.quantity}</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #2a9d8f;">Price: ₹${item.price}</p>
      </td>
    </tr>
  `).join('')}
</table>


            <p style="margin-top: 20px; font-size: 16px;">
              We will notify you once your order is shipped. Thank you for shopping with us!
            </p>

            <p style="margin-top: 20px; font-weight: bold; text-align: center;">
              The invoice PDF is attached for your reference.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            GlowByNjk | support@glowbynjk.com
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `invoice_${order.invoiceNumber}.pdf`,
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};



//  const sendOrderEmail = async (to, order) => {
//   const pdfPath = await generateInvoicePDF(order);

//   const mailOptions = {
//     from: `"GlowByNjk" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: `Order Confirmation - #${order.orderNumber}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; color: #333;">
//         <h2 style="color: #2a9d8f;">Thank You for Your Order!</h2>
//         <p>Your order has been successfully placed.</p>
//         <p><b>Order Number:</b> ${order.orderNumber}</p>
//         <p><b>Total Amount:</b> ₹${order.totalAmount}</p>
//         <p>The invoice PDF is attached for your reference.</p>
//       </div>
//     `,
//     attachments: [
//       {
//         filename: `invoice_${order.invoiceNumber}.pdf`,
//         path: pdfPath,
//       },
//     ],
//   };

//   await transporter.sendMail(mailOptions);
// };

// ✅ Send Shipping Update Email
const sendShippingEmail = async (to, order) => {
  const mailOptions = {
    from: `"GlowByNjk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Order #${order.orderNumber} Has Been Shipped`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #e76f51;">Your Order is On Its Way!</h2>
          <p>Good news! Your order has been shipped. Here are the shipping details:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Order Number:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Status:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.status}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Estimated Delivery:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.estimatedDelivery ? order.estimatedDelivery.toDateString() : "-"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Shipping Provider:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.shippingProvider || "-"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Contact:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.shippingPhone || "-"}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">You can track your order using the details above. Thank you for shopping with GlowByNjk!</p>

          <p style="margin-top: 30px; font-size: 12px; color: #888;">GlowByNjk | support@glowbynjk.com</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};


const sendDeliveredEmail = async (to, order) => {
  const mailOptions = {
    from: `"GlowByNjk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Order #${order.orderNumber} Has Been Delivered`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #2a9d8f;">Order Delivered!</h2>
          <p>Good news! Your order has been successfully delivered. Here are the details:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Order Number:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Status:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.status}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Delivered On:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.estimatedDelivery ? order.estimatedDelivery.toDateString() : '-'}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">Thank you for shopping with GlowByNjk! We hope you enjoy your purchase.</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">GlowByNjk | support@glowbynjk.com</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};


const sendCancelledEmail = async (to, order) => {
  const mailOptions = {
    from: `"GlowByNjk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Order #${order.orderNumber} Has Been Cancelled`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #e76f51;">Order Cancelled</h2>
          <p>We regret to inform you that your order has been cancelled. Here are the details:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Order Number:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Status:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.status}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><b>Cancelled On:</b></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toDateString()}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">If you have any questions, please contact our customer support.</p>

          <p style="margin-top: 30px; font-size: 12px; color: #888;">GlowByNjk | support@glowbynjk.com</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};


module.exports = { sendOrderEmail, sendShippingEmail, sendDeliveredEmail, sendCancelledEmail };
