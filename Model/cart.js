const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Assuming you have a User model
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product', // Reference to product model
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('cart', cartSchema);
