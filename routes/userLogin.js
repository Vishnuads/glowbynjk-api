const express = require('express')
const { updateWordPressPassword,sendNewsletter, registerLogin, registerGetAll, registerInsert,updateGiftCard,newsletterGet,newsletterDelete, deleteGiftCard,newsletter, forgetPassword,userGetId, resetPassword,updateUser, userDelete } = require('../controller/userLogin')
const verifyToken = require('../middleware/verifytoken')
const router = express.Router()
const auth = require('../middleware/auth')
router.post('/register',registerInsert)
router.post('/login',registerLogin)
router.get('/registerget',registerGetAll)
router.post('/forgotpassword',forgetPassword)
router.put('/resetpassword/:token',resetPassword)
router.put("/useraccount/edit/:id", verifyToken, updateUser);
router.get("/user/single",verifyToken, userGetId)
router.delete('/login/:id',userDelete)

router.put("/user/giftcard/:id", updateGiftCard);
router.delete("/user/:id/giftcard", deleteGiftCard);


router.post("/newsletter",newsletter)
router.get("/newsletter",newsletterGet)
router.delete("/newsletter/:id",newsletterDelete)
router.post("/newsletter/send",sendNewsletter)

router.put("/update-wordpress-password", updateWordPressPassword);



module.exports = router