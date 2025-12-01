const Admin = require('../model/adminLogin')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerGet = async (req,res) => {
    res.send('Hi i Am anand')
}

const registerInsert = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Required field empty" });
    }

    const userEmail = await Admin.findOne({ email });
    if (userEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const userDetails = await Admin.create({
      email,
      password: hash,
      role: "admin" // if you want it admin by default
    });

    return res.status(201).json({ userDetails });
  } catch (error) {
    console.log("Insert error", error);
    return res.status(500).json({ error: "Server error" });
  }
};

//   const registerLogin = async (req,res) => {
//     try{
//  const {email,password} = req.body
//     if(!email || !password){
//         return res.status(400).json({error:"Required field empty"})
//     }
//     const userEmail = await Admin.findOne({email})
//     if(!userEmail){
//         return res.status(400).json({error:"Email not Exists"})
//     }
//     const userPass = await bcrypt.compare(password,userEmail.password)
//     if(!userPass){
//         return res.status(400).json({error:'Password not valid'})
//     }
//     if(userEmail && userPass){
//         const userToken = await jwt.sign({email,id:userEmail._id,role},process.env.SECRET_KEY)
//         return res.status(200).json({userToken,userEmail})
//     }
//     }catch(error){
//        return res.status(400).json({error:'error'})
//     }
//   }
  const registerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Required field empty" });
    }

    // Find user
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email does not exist" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password not valid" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
    );

    // Send response
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const registerGetAll = async (req,res) =>{
   try{
     const getAll = await Admin.find().select(['-password'])
     return res.status(200).json(getAll)
   }catch(error){
    return res.status(400).json({message:'getall error'})
   }
}

module.exports = {registerGet,registerInsert,registerLogin,registerGetAll}