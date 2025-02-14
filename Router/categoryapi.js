const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const category = require('../Model/category');

// Create a new category
router.post('/addCategory', async (req, res) => {
    const newCategory = new category({
        category_name: req.body.category_name,
        category_description: req.body.category_description,
    });

    try {
        const savedCategory = await newCategory.save();
        res.status(200).json({ message: 'Category added successfully', data: savedCategory });
    } catch (err) {
        res.status(400).json({ message: 'Error adding category', error: err.message || err.stack });
    }
});

// Get all categories
router.get('/getCategory', async (req, res) => {
    try {
        const categories = await category.find();
        res.status(200).json({ message: 'Success', data: categories });
    } catch (err) {
        res.status(400).json({ message: 'Error fetching categories', error: err.message || err.stack });
    }
});

// Get a single category by ID
router.get('/singleCategory/:categoryId', async (req, res) => {
    const categoryId = req.params.categoryId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID' });
    }

    try {
        const categoryData = await category.findById(categoryId);
        if (!categoryData) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Success', data: categoryData });
    } catch (err) {
        res.status(400).json({ message: 'Error fetching category', error: err.message || err.stack });
    }
});

// Delete a category by ID
router.delete('/deleteCategory/:categoryId', async (req, res) => {
    const categoryId = req.params.categoryId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID' });
    }

    try {
        const deletedCategory = await category.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully', data: deletedCategory });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting category', error: err.message || err.stack });
    }
});

// Update a category by ID
router.put('/updateCategory/:categoryId', async (req, res) => {
    const categoryId = req.params.categoryId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: 'Invalid category ID' });
    }

    try {
        const updatedCategory = await category.findByIdAndUpdate(categoryId, {
            $set: req.body,
        }, { new: true });
        
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category updated successfully', data: updatedCategory });
    } catch (err) {
        res.status(400).json({ message: 'Error updating category', error: err.message || err.stack });
    }
});

module.exports = router;
