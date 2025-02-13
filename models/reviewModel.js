// review /rating /createdAt /ref to tour /ref to user
const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review must contain a comment'],
            maxLength: [500, 'Review must not exceed 500 characters'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'Review must have a rating'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

// virtual populate for user and tour
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    })
    next()
})

reviewSchema.statics.calcAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1 },
                averageRating: { $avg: '$rating' },
            },
        },
    ])

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].averageRating,
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        })
    }
}

reviewSchema.post('save', function () {
    // this points to current review
    this.constructor.calcAverageRating(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
  
    this.r = await this.model.findOne(this.getQuery())
    
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRating(this.r.tour)
})
const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
