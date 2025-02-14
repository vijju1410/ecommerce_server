var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
require('dotenv').config(); 
const app = express()
const userapi = require('./Router/userapi');
const productapi = require('./Router/productapi');  // Add this line
const categoryapi = require('./Router/categoryapi');  // Add this line for category API routes
const cartapi = require('./Router/cartapi');
const orderapi = require('./Router/orderapi');
const payment = require("./Router/payment");
app.use('/uploads', express.static('uploads'));


app.use(cors())
app.use(bodyParser.json())


app.use('/api',userapi);
app.use('/api/products', productapi);  // Add this line for product API routes
app.use('/api/categories', categoryapi);  // Add this line for category routes
app.use('/api/cart', cartapi);
app.use('/api/orders', orderapi);
app.use("/api/payment", payment);

const port = process.env.PORT || 5000;


const db = require('./db')

app.get('/',(req,res) => {

    res.send("hello world from server")
})
app.listen(port, ()=>{



console.log(`Server is running on http://localhost:${port}`)

})