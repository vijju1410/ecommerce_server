const express = require('express');
const router = express.Router();
const Cart = require('../Model/cart');
const Product = require('../Model/product');

// ✅ 1. Add Item to Cart
router.post('/addToCart', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: [], totalPrice: 0 });
        }

        const existingProductIndex = cart.products.findIndex(p => p.productId.toString() === productId);

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        cart.totalPrice += product.product_price * quantity;

        const updatedCart = await cart.save();
        res.status(200).json({ message: 'Item added to cart', cart: updatedCart });

    } catch (err) {
        res.status(500).json({ message: 'Error adding to cart', error: err.message });
    }
});
// ✅ 2. Get Cart by User ID
router.get('/getCart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let cart = await Cart.findOne({ userId }).populate('products.productId');
        
        // If no cart exists for this user, create an empty one
        if (!cart) {
            cart = new Cart({ userId, products: [], totalPrice: 0 });
            await cart.save();
        }

        res.status(200).json({ message: 'Cart retrieved successfully', cart });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching cart', error: err.message });
    }
});

// ✅ 3. Update Cart Item Quantity
router.put('/updateCart', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not in cart' });
        }

        const product = await Product.findById(productId);
        cart.totalPrice -= cart.products[productIndex].quantity * product.product_price;
        cart.products[productIndex].quantity = quantity;
        cart.totalPrice += quantity * product.product_price;

        const updatedCart = await cart.save();
        res.status(200).json({ message: 'Cart updated', cart: updatedCart });

    } catch (err) {
        res.status(500).json({ message: 'Error updating cart', error: err.message });
    }
});

// ✅ 4. Remove Item from Cart
router.delete('/removeFromCart', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not in cart' });
        }

        const product = await Product.findById(productId);
        cart.totalPrice -= cart.products[productIndex].quantity * product.product_price;
        cart.products.splice(productIndex, 1);

        const updatedCart = await cart.save();
        res.status(200).json({ message: 'Item removed from cart', cart: updatedCart });

    } catch (err) {
        res.status(500).json({ message: 'Error removing item from cart', error: err.message });
    }
});

// ✅ 5. Clear Cart
router.delete('/clearCart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Clear the products and reset the total price
        cart.products = [];
        cart.totalPrice = 0;

        const updatedCart = await cart.save();
        res.status(200).json({ message: 'Cart cleared successfully', cart: updatedCart });
    } catch (err) {
        res.status(500).json({ message: 'Error clearing cart', error: err.message });
    }
});



module.exports = router;
