const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        unique: true,  // Ensures category names are unique
    },
    category_description: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('category', categorySchema);
