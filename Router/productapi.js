const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const product = require("../Model/product");
const category = require("../Model/category");

// Multer Storage for Image Upload
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Add Product (With Image Upload)
router.post("/addProduct", upload.single("product_image"), async (req, res) => {
    try {
        const newProduct = new product({
            product_name: req.body.product_name,
            product_description: req.body.product_description,
            product_price: req.body.product_price,
            product_category: req.body.product_category,  // Should match _id in category collection
            product_brand: req.body.product_brand,
            product_image: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : "",
        });

        const savedProduct = await newProduct.save();
        res.status(200).json({ message: "Product added successfully", data: savedProduct });
    } catch (err) {
        res.status(400).json({ message: "Error adding product", error: err });
    }
});

// Get Products with Aggregation, Pagination & Filtering
router.get("/getProduct", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const skip = (page - 1) * limit;
  
      // Aggregation pipeline
      const products = await product.aggregate([
        {
          $lookup: {
            from: "categories",  // name of the category collection
            localField: "product_category",  // the field in the product collection
            foreignField: "category_name",  // the field in the category collection
            as: "category_info",  // alias for the joined category data
          },
        },
        {
          $unwind: "$category_info",  // Flatten the category info
        },
        {
          $skip: skip,  // Pagination skip
        },
        {
          $limit: limit,  // Pagination limit
        },
      ]);
  
      const totalProducts = await product.countDocuments();
  
      res.status(200).json({
        message: "Success",
        data: products,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      });
    } catch (err) {
      res.status(400).json({ message: "Error fetching products", error: err });
    }
  });

// Get Product by ID with Category Details
router.get("/getProductById/:id", async (req, res) => {
    try {
        const productData = await product.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.params.id) }  // Corrected here
            },
            {
                $lookup: {
                    from: "categories",  // Ensure the collection name is 'categories' (case-sensitive)
                    localField: "product_category",  // Field in product collection that holds the category name
                    foreignField: "category_name",  // Field in category collection that holds the category name
                    as: "category_details"  // The alias for the joined data
                }
            },
            {
                $unwind: {
                    path: "$category_details",  // Flatten the category_details array
                    preserveNullAndEmptyArrays: true  // Keep the product even if no matching category is found
                }
            }
        ]);

        if (!productData || productData.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(productData[0]);  // Return the first product from the array
    } catch (err) {
        console.error("Error fetching product:", err);  // Log the actual error
        res.status(400).json({ message: "Error fetching product", error: err.message });
    }
});
// Edit Product by ID
router.put("/editProduct/:id", upload.single("product_image"), async (req, res) => {
    try {
        const updatedData = {
            product_name: req.body.product_name,
            product_description: req.body.product_description,
            product_price: req.body.product_price,
            product_category: req.body.product_category,
            product_brand: req.body.product_brand,
        };

        // If a new image is uploaded, update the image URL
        if (req.file) {
            updatedData.product_image = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const updatedProduct = await product.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully", data: updatedProduct });
    } catch (err) {
        res.status(400).json({ message: "Error updating product", error: err });
    }
});

// Delete Product by ID
router.delete("/deleteProduct/:id", async (req, res) => {
    try {
        const deletedProduct = await product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: "Error deleting product", error: err });
    }
});

module.exports = router;
