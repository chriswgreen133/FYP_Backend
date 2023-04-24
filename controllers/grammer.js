const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const { json } = require('body-parser');

mongoose.connect(
    'mongodb+srv://chriswgreen11:chriswgreen133@fyp.4yejyi1.mongodb.net/reviews?retryWrites=true&w=majority'
).then(() => {
    console.log("DB connected")
}).catch(() => {
    console.log('Error occured, DB connection failed ')
})

const transcribe = async (req, res, next) => {
    audio_file = req.body
    console.log(audio_file)

    try {
        // transcribe

    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find school.',
            500
        );
        return next(error);
    }

    res.status(200).json("Success");
}

const analysis = async (req, res, next) => {
    let newReply = req.body;
    console.log("inside addreply")
    const reviewID = req.params.rid;
    console.log(newReply)
    console.log(reviewID)

    let review;
    try {
        review = await Review.findById(reviewID);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update post.',
            500
        );
        return next(error);
    }

    //let allComments = review.comments;

    // && newReply.text != undefined && newReply.username != undefined
    // && newReply.userID != undefined
    if (newReply != null || newReply != undefined) {
        review.reply.push(newReply)
        console.log(newReply)
    }

    try {
        await review.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update Review.',
            500
        );
        console.log(err)
        return next(error);
    }

    res.status(200).json(review);

}

exports.transcribe = transcribe;
exports.analysis = analysis;
