const mongoose = require('mongoose');
const router = require('../Router/userapi');
const userSchema = new mongoose.Schema({
        user_name: {
            type: String,
            required: true,
        },
        user_email:{
            type: String,
            required: true,
            unique: true,
        },
        user_mobile:{
            type:String,
            required: true,
        },
        user_gender:{
            type: String,
            enum:['Male','Female','Other'],
            default: 'Male',
        },
        password:{
            type:String,
            required:true,
        },
        user_role: {
            type: String,
            enum: ['user', 'admin'],  // Ensures only valid roles
            default: 'user',
        },
        });
        module.exports = mongoose.model('user',userSchema);