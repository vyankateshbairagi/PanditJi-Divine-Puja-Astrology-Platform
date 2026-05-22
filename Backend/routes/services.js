// routes/services.js

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const upload = require('../middleware/upload');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/active', serviceController.getActiveServices);
router.get('/:id', serviceController.getServiceById);

// Admin routes with image upload
router.post('/', upload.single('image'), serviceController.createService);
router.put('/:id', upload.single('image'), serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;