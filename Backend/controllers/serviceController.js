// serviceController.js
const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');

// Helper function to get image URL for services
const getServiceImageUrl = (req, filename) => {
  if (!filename) return '';
  return `${req.protocol}://${req.get('host')}/uploads/services/${filename}`;
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active services
exports.getActiveServices = async (req, res) => {
  try {
    if (Service.db.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is unavailable. Please try again shortly.'
      });
    }

    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    res.json(services);
  } catch (error) {
    console.error('Error fetching active services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active services'
    });
  }
};

// Create new service with image upload
exports.createService = async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      // With Cloudinary, req.file.path gives the full URL
      image: req.file ? req.file.path : (req.body.image || '')
    };

    // Parse array fields
    if (typeof serviceData.details === 'string') {
      serviceData.details = JSON.parse(serviceData.details);
    }

    const service = new Service(serviceData);
    await service.save();
    
    console.log(`✅ Service created with image: ${service.image}`);
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(400).json({ message: error.message });
  }
};

// FIND the updateService function
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const updateData = {
      ...req.body,
      image: req.file ? req.file.path : req.body.image
    };

    // Parse array fields
    if (typeof updateData.details === 'string') {
      updateData.details = JSON.parse(updateData.details);
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`✅ Service updated: ${updatedService.name}`);
    res.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(400).json({ message: error.message });
  }
};

// FIND the deleteService function - REMOVE local file deletion
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // ✅ REMOVE this local file deletion code
    // if (service.image && !service.image.includes('/images/')) {
    //   const filename = service.image.split('/').pop();
    //   const imagePath = path.join('uploads', 'services', filename);
    //   if (fs.existsSync(imagePath)) {
    //     fs.unlinkSync(imagePath);
    //   }
    // }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
