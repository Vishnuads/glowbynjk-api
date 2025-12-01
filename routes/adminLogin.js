const express = require('express')
const {   registerLogin, registerInsert, forgetPassword, resetPassword } = require('../controller/adminLogin')
const verifyToken = require('../middleware/verifytoken')
const router = express.Router()

router.post('/admin/register',registerInsert)
router.post('/admin/login',registerLogin)
module.exports = router