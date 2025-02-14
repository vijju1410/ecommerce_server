const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true,
    },
    product_description: {
        type: String,
        required: true,
    },
    product_price: {
        type: Number,
        required: true,
    },
    product_category: {
        type: String,
        required: true,
    },
    product_brand: {
        type: String,
        required: true,
    },
    product_image: {
        type: String, // URL of the image
        required: true,
    }
}, { timestamps: true }); // Adds createdAt & updatedAt timestamps

module.exports = mongoose.model('product', productSchema);
