const express = require('express');
const router = express.Router();
const { createPost, getCalendarPosts, reviewPost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and videos are allowed!'));
  }
});

router.post('/', protect, upload.single('mediaFile'), createPost);
router.get('/calendar/:orgId', protect, getCalendarPosts);
router.post('/:postId/review', protect, reviewPost);

module.exports = router;
