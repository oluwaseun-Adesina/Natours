const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
    console.log(err.name, err.message)
    process.exit(1)
})
dotenv.config()

// const DB = process.env.DATABASE.replace(
//     '<PASSWORD>',
//     process.env.DATABASE_PASSWORD
// )
const DB = process.env.DATABASE_LOCAL

mongoose.connect(DB).then(() => console.log('DB connection successful!'))

const app = require('./app')

const port = process.env.PORT || 4000
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`)
})

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...')
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})
