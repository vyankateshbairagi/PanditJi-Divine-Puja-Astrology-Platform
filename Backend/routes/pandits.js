// routes/pandits.js

const express = require('express');
const router = express.Router();
const panditController = require('../controllers/panditController');
const upload = require('../middleware/upload');


// Public routes
router.get('/locations', panditController.getPanditLocations);
router.get('/', panditController.getAllPandits);
router.get('/filters', panditController.getFilterOptions);
router.get('/:id', panditController.getPanditById);


// Admin routes with image upload - using specific field name
router.post('/', upload.single('panditImage'), panditController.createPandit);
router.put('/:id', upload.single('panditImage'), panditController.updatePandit);
router.delete('/:id', panditController.deletePandit);

module.exports = router;