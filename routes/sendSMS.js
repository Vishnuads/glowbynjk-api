// // routes/smsRoutes.js
const express = require('express')
const {sendUserSms} = require("../controller/sendSMS.js");

const router = express.Router();

router.post("/client/sms/send", sendUserSms);

module.exports = router