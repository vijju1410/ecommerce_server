const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables

// Use environment variable for MongoDB URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce_server';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;
