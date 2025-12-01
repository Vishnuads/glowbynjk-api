const express = require("express");
const {approveCustomerComment,approveCustomerReviewId,customerReviewPost,customerReviewGet,customerReviewId,customerReviewDelete, createBlog, getBlogs, getBlogById, updateBlog, deleteBlog,upload, blogComments, blogId, blogCommentsDelete, blogGet } = require("../controller/blog");
const router = express.Router();

router.post("/blog", upload.single("blogimage"), createBlog);
router.get("/blog", getBlogs);
router.get("/blog/:id", getBlogById);
router.put("/blog/:id", upload.single("blogimage"), updateBlog);
router.delete("/blog/:id", deleteBlog);


// blog posts

router.post("/blogpost", blogComments)
router.get("/blogcomments",blogGet)
router.get("/blogcomments/:blogId",blogId)     
router.delete("/blogpost/:id",blogCommentsDelete)


//customerreview

router.post("/customerreview", customerReviewPost)
router.get("/customerreview",customerReviewGet)
// router.get("/customerreview/:productId",customerReviewId)     
router.delete("/customerreview/:id",customerReviewDelete)
router.patch("/admin/approve-comment/:commentId", approveCustomerComment);
router.get("/customerreview/:productId",approveCustomerReviewId)     

module.exports = router;
