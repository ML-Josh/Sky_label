const express = require('express');
const categoryController = require('~server/app/controller/v1.0/catetoryController');

const router = express.Router();

router.get('/myCategories', categoryController.getMyCategories);
router.post('/createCategory', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
