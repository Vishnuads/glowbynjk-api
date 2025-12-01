const mongoose = require('mongoose')

const AdminComboDealsSchema = mongoose.Schema({
      combodealsimg:{
        type:String,
        required:true
      }
},{timestamps:true})


module.exports = mongoose.model('combodeals',AdminComboDealsSchema)  