const express = require('express');
const router = express.Router();
const user = require('../Model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const authenticateUser = require('../middlewares/authMiddleware'); 
const twilio = require('twilio');



// Twilio Credentials from .env
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);
// Register API
// Register API with Twilio SMS
router.post('/addUser', async (req, res) => {
    try {
        const existingUser = await user.findOne({ user_email: req.body.user_email });
        if (existingUser) {
            return res.status(400).json({ Message: "Email is already registered" });
        }

        const hashpassword = await bcrypt.hash(req.body.password, 10);

        const SaveUser = new user({
            user_name: req.body.user_name,
            user_email: req.body.user_email,
            user_mobile: req.body.user_mobile,
            user_gender: req.body.user_gender,
            password: hashpassword,
            user_role: req.body.user_role || 'user',
        });

        const SaveData = await SaveUser.save();

        // 📲 Send Welcome SMS via Twilio
        const messageBody = `Hello ${req.body.user_name}, Welcome to ElectroHub! 🎉 Thank you for registering with us. Happy Shopping! 🛒`;

        client.messages
            .create({
                body: messageBody,
                from: twilioPhoneNumber, // Twilio Verified Phone Number
                to: req.body.user_mobile // User's Mobile Number
            })
            .then(message => console.log(`Twilio SMS Sent: ${message.sid}`))
            .catch(error => console.error('Twilio SMS Error:', error));

        res.status(201).json({ Message: "User Created Successfully", data: SaveData, status: 1 });
    } catch (error) {
        res.status(500).json({ Message: "Internal Server Error", error: error.message });
    }
});
// Login API with JWT Token Generation
router.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const emailExists = await user.findOne({ user_email: email });

        if (!emailExists) {
            return res.status(400).json({ Message: "Email not found", status: "fail" });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, emailExists.password);
        if (!isPasswordValid) {
            return res.status(400).json({ Message: "Incorrect password", status: "fail" });
        }

        // 🔑 Generate JWT Token
        const token = jwt.sign(
            { userId: emailExists._id, user_role: emailExists.user_role }, // Payload
            process.env.JWT_SECRET, // Secret Key
            { expiresIn: '1h' } // Token Expiration
        );

        res.status(200).json({
            Message: "Login Successful",
            status: "success",
            token: token, // ✅ Send token in response
            data: {
                user_id: emailExists._id,
                user_email: emailExists.user_email,
                user_name: emailExists.user_name,
                user_gender:emailExists.user_gender,
                user_mobile:emailExists.user_mobile,
                user_role: emailExists.user_role,
                
            }
        });
    } catch (error) {
        res.status(500).json({ Message: "Internal Server Error", error: error.message });
    }
});

// Get All Users (Protected)
// Get All Users (Protected) with Pagination
router.get('/getUser', authenticateUser, async (req, res) => {
    try {
        // Set default pagination values
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 5;  // Default to 5 users per page

        // Skip is the number of documents to skip based on the page
        const skip = (page - 1) * limit;

        // Fetch users with pagination
        const userData = await user.find()
            .skip(skip)  // Skip the number of users to paginate
            .limit(limit);  // Limit the number of users fetched

        // Get the total count of users
        const totalUsers = await user.countDocuments();

        // Return paginated response
        res.status(200).json({
            Message: "Success",
            data: userData,
            totalPages: Math.ceil(totalUsers / limit),  // Calculate total pages
            currentPage: page,
            totalUsers: totalUsers,
        });
    } catch (error) {
        res.status(500).json({ Message: "Internal Server Error", error: error.message });
    }
});

// Get Single User
router.get('/singleUser/:userId', authenticateUser, async (req, res) => {
    try {
        const userId = req.params.userId;
        const userdata = await user.findById(userId);
        if (!userdata) {
            return res.status(404).json({ Message: "User not found" });
        }
        res.status(200).json({ Message: "Success", data: userdata });
    } catch (error) {
        res.status(500).json({ Message: "Internal Server Error", error: error.message });
    }
});

// Delete User 
router.delete('/deleteUser/:userId', authenticateUser, async (req, res) => {
    try {
        const userId = req.params.userId;
        const userdata = await user.findByIdAndDelete(userId);
        if (!userdata) {
            return res.status(404).json({ Message: "User not found" });
        }
        res.status(200).json({ Message: "User Deleted", data: userdata });
    } catch (error) {
        res.status(500).json({ Message: "Internal Server Error", error: error.message });
    }
});

// Update User 
router.put('/updateUser/:userId', authenticateUser, async (req, res) => {
    try {
        const userId = req.params.userId;
        const updateUser = await user.findByIdAndUpdate(userId, { $set: req.body }, { new: true });
        if (!updateUser) {
            return res.status(404).json({ Message: "User not found" });
        }
        res.status(200).json({ Message: "User Updated", data: updateUser });
    } catch (error) {
        res.status(500).json({ Message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
