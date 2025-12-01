const HottestBanner = require('../model/adminBanner')
const ComboDeals = require('../model/adminComboDeals')
const multer  = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/banners')
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' +  file.originalname
    cb(null,filename)
  }
})

const upload = multer({ storage: storage })



// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//       folder: 'glowbynjk/home',
//       public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0] + ""
//   },
// });

// const upload = multer({ storage: storage });


//home banner upload
const homeBannerGet = async (req,res) => {
   try{
     const stud = await HottestBanner.find()
     return res.json(stud)
   }catch(error){
    return res.status(400).json({message:'error'})
   }
}

const homeBannerGetId = async (req,res) => {
   try{
   const stud = await HottestBanner.findById(req.params.id)
   return res.json(stud)
   }catch(error){
    return res.status(400).json({message:'error'})
   }
}
          
const homeBannerInsert = async (req,res) => {
try{
const { bannername } = req.body;
 if(!bannername){
   return res.status(400).json({error:'required field is empty'})
 }  
 const newAdd = {bannername}
 if(req.file){
     newAdd.bannerimage=`uploads/banners/${req.file.filename}`;
 } 
 const newAdding = await HottestBanner.create(newAdd)
  return res.status(200).json(newAdding)
}catch(error){
   return res.status(400).json({error:"insert error"})
}
}

const homeBannerUpdate = async (req,res) => {
   try{
 const {bannername} = req.body
 const updateBanner = await HottestBanner.findById(req.params.id)
 if(updateBanner){
     let bannerimage = `uploads/banners/${req.file.filename}` ? `uploads/banners/${req.file?.filename}`:updateBanner.bannerimage
     await HottestBanner.findByIdAndUpdate(req.params.id,{...req.body,bannerimage},{new:true})
       res.status(200).json({bannername})
 }
   }catch(error){
   res.status(400).json({error:'updated error'})
   }
}

const homeBannerDelete = async (req,res) => {
   try{
    await HottestBanner.deleteOne({_id:req.params.id})
     res.status(200).json({message:'deleted success'})
   }catch(error){
    res.status(400).json({message:"deleted error"})
   }
}


//combo deals banner upload
const comboGet = async (req,res) => {
   try{
     const stud = await ComboDeals.find()
     return res.json(stud)
   }catch(error){
    return res.status(400).json({message:'error'})
   }
}

const comboGetId = async (req,res) => {
   try{
   const stud = await ComboDeals.findById(req.params.id)
   return res.json(stud)
   }catch(error){
    return res.status(400).json({message:'error'})
   }
}
          
const comboInsert = async (req, res) => {
  console.log(req.file, req.body);
  try {
    // if no file uploaded
    if (!req.file) {
      return res.status(400).json({ error: "required field is empty" });
    }

    const newCombo = await ComboDeals.create({
      combodealsimg: `uploads/banners/${req.file.filename}`
    });

    return res.status(200).json(newCombo);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Upload error" });
  }
};


const comboUpdate = async (req,res) => {
   try{
 const updateBanner = await ComboDeals.findById(req.params.id)
 if(updateBanner){
     let combodealsimg = `uploads/banners/${req.file.filename}` ? `uploads/banners/${req.file?.filename}`:updateBanner.combodealsimg
     await ComboDeals.findByIdAndUpdate(req.params.id,{...req.body,combodealsimg},{new:true})
       res.status(200).json({message:'success'})
 }
   }catch(error){
   res.status(400).json({error:'updated error'})
   }
}

const comboDelete = async (req,res) => {
   try{
    await ComboDeals.deleteOne({_id:req.params.id})
     res.status(200).json({message:'deleted success'})
   }catch(error){
    res.status(400).json({message:"deleted error"})
   }
}


module.exports = {
    homeBannerGet,
    homeBannerGetId,
    homeBannerInsert,
    homeBannerUpdate,
    homeBannerDelete,
    comboInsert,
    comboGet,
    comboGetId,
    comboUpdate,
    comboDelete,
    upload
}