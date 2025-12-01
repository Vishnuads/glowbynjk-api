const mongoose = require('mongoose')

const AdminBannerSchema = mongoose.Schema({
      bannername:{
        type:String,
        required:true
      },
      bannerimage:{
        type:String,
        required:true
      }
},{timestamps:true})


module.exports = mongoose.model('hottestoffers',AdminBannerSchema)  