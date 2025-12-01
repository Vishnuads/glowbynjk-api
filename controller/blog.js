const Blog = require("../model/blog");
const multer = require("multer");
const path = require("path");
const Comment = require("../model/blogPost")
const customerReview = require('../model/CustomerReview')
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//       folder: 'glowbynjk/blogs',
//       public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0] + ""
//   },
// });

// const upload = multer({ storage: storage });  

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/blogs'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// CREATE
const createBlog = async (req, res) => {
  try {
    const { category, title, description } = req.body;
    if (!category || !title || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    const blog = await Blog.create({
      category,
      title,
      description,
      blogimage: req.file ? req.file.path : null,
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Create error", error });
  }
};

// READ (all)
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Fetch error", error });
  }
};

// READ (by id)
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    res.json(blog);
  } catch (error) {
    res.status(404).json({ message: "Not found" });
  }
};

// UPDATE
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        blogimage: req.file ? req.file.path : blog.blogimage,
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Update error", error });
  }
};

// DELETE
const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete error", error });
  }
};

// blog posts

const blogComments = async (req,res) => {
 try {
    const newComment = new Comment(req.body);
    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


const blogGet = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const blogId = async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE a comment
const blogCommentsDelete =  async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//customerreview
const customerReviewPost = async (req, res) => {
  // const { username, useremail, message } = req.body;
  // if ( !username || !useremail || !message) {
  //   return res.status(400).json({ error: "All fields are required." });
  // }

  // try {
  //   const customerReviews = new customerReview(req.body);
  //   const saved = await customerReviews.save();
  //   res.status(201).json(saved);
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }
   try {
    const { productId, customername, customeremail, customermessage } = req.body;
    if (!productId || !customername || !customeremail || !customermessage ) {
      return res.status(400).json({ message: "All fields required" });
    }
    const customer = await customerReview.create({
      productId,
      customername,
      customeremail,
      customermessage
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Create error", error });
  }
};


const customerReviewId = async (req, res) => {
  try {
    const comments = await customerReview.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Approve a comment by id
const approveCustomerComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const updated = await customerReview.findByIdAndUpdate(
      commentId,
      { approved: true },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const approveCustomerReviewId = async (req, res) => {
  try {
    const comments = await customerReview.find({
      productId: req.params.productId,
      approved: true,  // ✅ only approved
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const customerReviewGet = async (req, res) => {
  try {
    const comments = await customerReview.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// DELETE a comment
const customerReviewDelete =  async (req, res) => {
  try {
    await customerReview.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { 
  createBlog,
   getBlogs, 
   getBlogById, 
   updateBlog,
    deleteBlog, 
    upload, 
    blogComments,
    blogId,
    blogCommentsDelete,
    blogGet,
    customerReviewPost,
    customerReviewGet,
    customerReviewId,
    customerReviewDelete,
    approveCustomerComment,
    approveCustomerReviewId 
  };
