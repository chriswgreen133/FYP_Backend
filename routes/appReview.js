
const express = require('express');
const review = require('../controllers/appReview')

const router = express.Router();

router.get('/appReview', review.getReviews)

//router.post('/post', file_upload.single('image'), dashboard.createPost)//, dashboard.createPost)
router.post('/appReview', review.createReview)//, dashboard.createPost)

router.patch('/updateReview/:rid', review.addReply)

module.exports = router;