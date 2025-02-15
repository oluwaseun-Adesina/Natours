const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.alerts = (req, res, next) => {
    const { alert } = req.query
    if (alert === 'booking') {
        res.locals.alert = 'Your booking was successful! Please check your email for a confirmation. If your booking does not show up here immediately, please come back later.'
    }
    next()
}

exports.getOverview = catchAsync(async (req, res, next) => {
    // get tour data from collection
    const tours = await Tour.find()

    // build template

    // Render that tmeplate using the tour data from step 1

    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    // get the data from the requested toure (inlcude reviews and tour guilds)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'reviews rating user',
    })

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404))
    }
    // build template

    // render template using data from step 1
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    })
})

// login controller
exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    })

}

// signup controller
exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Create an account',
    })
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
    })
}

exports.getMyTours = catchAsync( async (req, res, next) =>{
    // 1) find all bookings
    const bookings = await Booking.find({user: req.user.id})

    // 2) find tours withthe returns Id
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: {$in : tourIDs}})

    res.status(200).render('overview', {
        title: "My Tours",
        tours
    })
})

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    )

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser,
    })
})
