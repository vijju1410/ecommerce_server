const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables

// Use environment variable for MongoDB URI
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));
module.exports = mongoose;
