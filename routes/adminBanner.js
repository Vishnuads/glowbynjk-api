const express = require('express')
const { homeBannerGet, homeBannerGetId, homeBannerInsert, homeBannerUpdate, homeBannerDelete, upload, comboGet, comboGetId, comboInsert, comboUpdate, comboDelete } = require('../controller/adminBanner')
const router = express.Router()

//Home page banner
router.get('/home/banner',homeBannerGet)
router.get('/home/banner/:id',homeBannerGetId)
router.post('/home/banner',upload.single('bannerimage'),homeBannerInsert)
router.put('/home/banner/:id',upload.single('bannerimage'),homeBannerUpdate)
router.delete('/home/banner/:id',homeBannerDelete)

//combo deals
router.get('/combodeal/banner',comboGet)
router.get('/combodeal/banner/:id',comboGetId)
router.post('/combodeal/banner',upload.single('combodealsimg'),comboInsert)
router.put('/combodeal/banner/:id',upload.single('combodealsimg'),comboUpdate)
router.delete('/combodeal/banner/:id',comboDelete)

//offer banner section

// router.get('/combodeal/banner')
// router.get('/combodeal/banner/:id')
// router.post('/combodeal/banner',upload.single('combodealsimg'))
// router.put('/combodeal/banner/:id',upload.single('combodealsimg'))
// router.delete('/combodeal/banner/:id')

module.exports = router