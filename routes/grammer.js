const express = require('express');
const grammer = require('../controllers/grammer.js')

const router = express.Router();

router.get('/transcribe', grammer.transcribe)

router.get('/analysis', grammer.analysis)

//router.post('/post', file_upload.single('image'), dashboard.createPost)//, dashboard.createPost)
// router.post('/post', grammer.createPost)//, dashboard.createPost)

// router.patch('/updateComment/:pid', grammer.addComments)

// router.patch('/updateLike/:pid', grammer.addLikes)

// router.get('/deletePost/:pid', grammer.deletePost)

module.exports = router;