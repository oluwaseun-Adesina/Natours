const Review = require('../models/reviewModel')
// const catchAsync = require('../utils/catchAsync')
const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

// create review
exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) {
        req.body.tour = req.params.tourId
    }
    if (!req.body.user) {
        req.body.user = req.user.id
    }
    next()
}

// get all reviews
exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
