const express = require('express');
const router = express.Router();

const Order = require('../Model/order');
const Cart = require('../Model/cart');
const User = require('../Model/user');  // ✅ Import User model to fetch username
const { v4: uuidv4 } = require('uuid'); 
const sendEmail = require("../utils/sendEmail"); // Import email function

// ✅ 1. Place an Order (Now Sends Email)
router.post("/placeOrder", async (req, res) => {
    try {
      const { userId, address, paymentMethod, paymentInfo } = req.body;
  
      // ✅ Fetch the user details
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Fetch the cart details
      const cart = await Cart.findOne({ userId }).populate("products.productId");
      if (!cart || cart.products.length === 0) {
        return res
          .status(400)
          .json({ message: "Cart is empty. Add items before placing an order." });
      }
  
      // ✅ Generate a unique order ID
      const orderId = `ORD-${uuidv4().split("-")[0]}`;
  
      // ✅ Prepare order data
      const orderData = {
        orderId,
        userId,
        username: user.user_name,
        items: cart.products.map((item) => ({
          productId: item.productId._id,
          productName: item.productId.product_name,
          quantity: item.quantity,
          price: item.productId.product_price,
          total: item.quantity * item.productId.product_price,
        })),
        totalPrice: cart.totalPrice,
        address,
        paymentMethod,
      };
  
      // ✅ Add paymentInfo for online payments
      if (paymentMethod === "Online") {
        if (!paymentInfo || !paymentInfo.paymentId) {
          return res
            .status(400)
            .json({ message: "Missing payment details for online payment." });
        }
        orderData.paymentInfo = {
          paymentId: paymentInfo.paymentId,
          status: paymentInfo.status,
        };
      }
  
      // ✅ Save order and clear cart
      const order = new Order(orderData);
      const savedOrder = await order.save();
      await Cart.findOneAndDelete({ userId });
  
      // ✅ 📧 Send Order Invoice Email
      const subject = "🛍️ Your Order Invoice - Thank You!";
      const text = `Hello ${user.user_name},\n\nYour order has been placed successfully.\n\nOrder ID: ${orderId}\nTotal: ₹${cart.totalPrice}\nPayment: ${paymentMethod}\n\nWe will notify you once it is shipped.\n\n- Your Shop Name`;
  
      // 📝 HTML email format
      const html = `
        <h2>Thank You for Your Order, ${user.user_name}!</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Order Summary:</strong></p>
        <ul>
          ${cart.products
            .map(
              (item) =>
                `<li>${item.productId.product_name} - ${item.quantity} x ₹${item.productId.product_price} = ₹${
                  item.quantity * item.productId.product_price
                }</li>`
            )
            .join("")}
        </ul>
        <p><strong>Total Amount:</strong> ₹${cart.totalPrice}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Delivery Address:</strong> ${address.street}, ${address.city}, ${address.state}, ${address.postalCode}</p>
        <p>We will notify you once your order is shipped.</p>
        <br>
        <p>Thanks for shopping with us! 😊</p>
        <strong>ElectroHub</strong>
      `;
  
      await sendEmail(user.user_email, subject, text, html);
  
      res.status(201).json({ message: "Order placed successfully", order: savedOrder });
    } catch (err) {
      res.status(500).json({ message: "Error placing order", error: err.message });
    }
  });
// ✅ 2. Get All Orders (Admin Only)
router.get('/allOrders', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'user_name user_email').populate('items.productId');
        res.status(200).json({ message: 'Orders fetched successfully', orders });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
});

// ✅ 3. Get User's Orders
router.get('/getUserOrders/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId })
            .populate('items.productId')
            .sort({ createdAt: -1 });  // ✅ Show latest orders first

        res.status(200).json({ message: 'User orders fetched successfully', orders });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
});


// ✅ 4. Update Order Status (Admin Only)
router.put('/updateOrderStatus/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (err) {
        res.status(500).json({ message: 'Error updating order status', error: err.message });
    }
});

// ✅ 5. Cancel Order
router.delete('/cancelOrder/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Restore products back to the cart
        await Cart.findOneAndUpdate(
            { userId: order.userId },
            { $push: { products: order.items } },
            { upsert: true }
        );

        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ message: 'Order cancelled and items restored to cart', order });
    } catch (err) {
        res.status(500).json({ message: 'Error cancelling order', error: err.message });
    }
});

module.exports = router;
