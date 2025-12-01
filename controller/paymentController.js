const crypto = require("crypto");

// CCAvenue Credentials
const workingKey = "DE406AADD5849DA480D57F100B8F2EA3"; // Replace with your working key
const accessCode = "AVQF58JK87AW43FQWA";
const merchantId = "1632895";



function encrypt(text) {
  const key = Buffer.from(workingKey.substring(0, 16), "utf8"); 
  const iv = Buffer.from(workingKey.substring(0, 16), "utf8");
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}



exports.initiatePayment = (req, res) => {
  const { amount, orderId, billingName, billingEmail } = req.body;
const data = `merchant_id=${merchantId}&order_id=${orderId}&currency=INR&amount=${amount}&redirect_url=http://localhost:5000/api/payment/response&cancel_url=http://localhost:5000/api/payment/response&language=EN&billing_name=${billingName}&billing_email=${billingEmail}`;
 const encryptedData = encrypt(data);
console.log("Encrypted Request:", encryptedData); // Should be hex string
res.json({ encRequest: encryptedData, accessCode });
;
console.log({ workingKey, accessCode, merchantId, data });

};

exports.paymentResponse = (req, res) => {
  const encryptedResponse = req.body.encResp;
  const decryptedResponse = decrypt(encryptedResponse);
  console.log("Decrypted Response:", decryptedResponse);
  res.json({ status: "success" });
};

function decrypt(text) {
  const key = Buffer.from(workingKey.substring(0, 16), "utf8");
  const iv = Buffer.from(workingKey.substring(0, 16), "utf8");
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
