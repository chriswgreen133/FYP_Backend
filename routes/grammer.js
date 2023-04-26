const express = require('express');
const grammer = require('../controllers/grammer.js')
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage });
  

router.post('/transcribe', upload.single('audioFile'), grammer.transcribe)

router.post('/analysis', grammer.analysis)

//router.post('/post', file_upload.single('image'), dashboard.createPost)//, dashboard.createPost)
// router.post('/post', grammer.createPost)//, dashboard.createPost)

// router.patch('/updateComment/:pid', grammer.addComments)

// router.patch('/updateLike/:pid', grammer.addLikes)

// router.get('/deletePost/:pid', grammer.deletePost)

module.exports = router;