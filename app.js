const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const cors = require('cors')
const compression = require('compression')
// const xss = require('xss')
const cookieParser = require('cookie-parser')
const hpp = require('hpp')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const bookingController = require('./controllers/bookingController')
const viewRouter = require('./routes/viewRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express()
app.enable('trust proxy') 
app.disable('x-powered-by')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Global  middlewares
// serve static files from the public directory

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'js')))
app.use(express.static(path.join(__dirname, 'img')))

// implement cors
app.use(cors())

app.options('*', cors())

// security HTTP HEAD requests
const scriptSrcUrls = [
    'https://api.tiles.mapbox.com/',
    'https://api.mapbox.com/',
    // add axios cdn
    'https://cdn.jsdelivr.net/',
    'https://cdnjs.cloudflare.com/ajax/libs/axios/',
    // add stripe
    'https://js.stripe.com/' // stripe

]
const styleSrcUrls = [
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/'
]
const connectSrcUrls = [
    "'self'",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    ...(process.env.NODE_ENV === "development" ? ["ws://localhost:1234"] : []), // Parcel HMR only in dev
    "https://api.stripe.com/",
    "https://js.stripe.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://cdnjs.cloudflare.com/ajax/libs/axios/",
    "https://api.mapbox.com/",
];


const frameSrcUrls = ['https://js.stripe.com/']
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com']
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:'],
            fontSrc: ["'self'", ...fontSrcUrls],
            frameSrc: ["'self'", ...frameSrcUrls],
        },
    })
)

// allow mapbox api through CSP and google fonts
// app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again in an hour.',
})

app.use('/api', limiter)

// stripe webhook, before body-parser, because stripe needs the body as stream
app.post(
    '/webhook-checkout',
    express.raw({ type: 'application/json' }),
    bookingController.webhookCheckout
)

// body parsing, reading data from the body into req.body
app.use(
    express.json({
        limit: '10kb', // limit request body size to 10kb
    })
)
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Data sanitization against nosql queries injection
app.use(mongoSanitize())

// data sanitization against xss
// app.use(xss())

// prevent parameter pollution

app.use(
    hpp({
        whitelist: [
            'duration',
            'difficulty',
            'price',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
        ], // fields allowed to be sanitized
    })
)

app.use(compression())

// test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    // console.log(req.cookies)
    next()
})

// route handler
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

// error handling not found routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app
