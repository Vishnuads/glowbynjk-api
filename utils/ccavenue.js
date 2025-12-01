const crypto = require("crypto")
function getKey(workingKey) {
  return crypto.createHash("md5").update(workingKey).digest();
}

 function encryptCCA(plainText, workingKey) {
  const key = getKey(workingKey);
  const iv = Buffer.alloc(16, 0); // 16-byte IV with zeros
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

 function decryptCCA(encText, workingKey) {
  const key = getKey(workingKey);
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let decrypted = decipher.update(encText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}


module.exports = {encryptCCA,decryptCCA}