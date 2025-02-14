const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/ecommerce_server')

mongoose.connection.on('connected',()=> {
    console.log ('connect to MongoDb new')
})

mongoose.connection.on('error', (err) => {
console.error('connection error: ',err)


})

module.exports = mongoose