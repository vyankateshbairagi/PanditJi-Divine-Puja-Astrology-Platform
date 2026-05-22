// panditController.js
const Pandit = require('../models/Pandit');
const fs = require('fs');
const path = require('path');

// Helper function to get image URL for pandits
const getPanditImageUrl = (req, filename) => {
  if (!filename) return '/images/icon.png'; // Default image
  return `${req.protocol}://${req.get('host')}/uploads/pandits/${filename}`;
};

// Get all pandits with filters
exports.getAllPandits = async (req, res) => {
  try {
    const { search, location, service, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { services: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Service filter
    if (service) {
      query.services = { $in: [new RegExp(service, 'i')] };
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const pandits = await Pandit.find(query)
      .select('name location services rating experience image isAvailable')
      .limit(limitNum)
      .skip(skip)
      .sort({ rating: -1, experience: -1 });
    
    const total = await Pandit.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      pandits,
      totalPages,
      currentPage: pageNum,
      total
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get filter options
exports.getFilterOptions = async (req, res) => {
  try {
    const locations = await Pandit.distinct('location');
    const services = await Pandit.distinct('services');
    
    res.json({
      locations: locations.filter(loc => loc).sort(),
      services: services.filter(srv => srv).sort()
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unique locations from pandits
exports.getPanditLocations = async (req, res) => {
  try {
    console.log('📍 Fetching unique pandit locations...');
    
    // Check if Pandit model exists and has data
    const Pandit = require('../models/Pandit');
    
    // Get all distinct locations
    const locations = await Pandit.distinct('location');
    
    console.log('Raw locations from DB:', locations);
    
    // Filter out empty, null, undefined values
    const validLocations = locations.filter(loc => {
      return loc && typeof loc === 'string' && loc.trim().length > 0;
    });
    
    // Sort alphabetically
    validLocations.sort();
    
    console.log('Valid locations to return:', validLocations);
    
    res.json({
      success: true,
      locations: validLocations,
      total: validLocations.length
    });
  } catch (error) {
    console.error('Error fetching pandit locations:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      locations: [] 
    });
  }
};

// Get single pandit
exports.getPanditById = async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found' });
    }
    res.json(pandit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FIND the createPandit function (around line 100)
exports.createPandit = async (req, res) => {
  try {
    // REPLACE the image URL assignment
    const panditData = {
      ...req.body,
      // With Cloudinary, req.file.path gives the full URL
      image: req.file ? req.file.path : (req.body.image || '/images/icon.png')
    };
    
    // Rest of the code remains the same...
    // Parse array fields from string to array
    if (typeof panditData.services === 'string') {
      panditData.services = JSON.parse(panditData.services);
    }
    if (typeof panditData.languages === 'string') {
      panditData.languages = JSON.parse(panditData.languages);
    }
    
    // Convert numeric fields
    if (panditData.rating) panditData.rating = parseFloat(panditData.rating);
    if (panditData.experience) panditData.experience = parseInt(panditData.experience);
    
    const pandit = new Pandit(panditData);
    await pandit.save();
    
    console.log(`✅ Pandit created with image: ${pandit.image}`);
    res.status(201).json(pandit);
  } catch (error) {
    console.error('Error creating pandit:', error);
    res.status(400).json({ message: error.message });
  }
};

// FIND the updatePandit function (around line 140)
exports.updatePandit = async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);
    if (!pandit) {
      return res.status(404).json({ 
        success: false,
        message: 'Pandit not found' 
      });
    }

    const updateData = { ...req.body };
    
    // Handle image update - Cloudinary URL is in req.file.path
    if (req.file) {
      updateData.image = req.file.path; // Cloudinary returns full URL
    }

    // Parse array fields (same as before)
    if (typeof updateData.services === 'string') {
      try {
        updateData.services = JSON.parse(updateData.services);
      } catch (e) {
        console.log('Services parsing error:', e);
      }
    }
    
    if (typeof updateData.languages === 'string') {
      try {
        updateData.languages = JSON.parse(updateData.languages);
      } catch (e) {
        console.log('Languages parsing error:', e);
      }
    }

    // Convert numeric fields
    if (updateData.rating) updateData.rating = parseFloat(updateData.rating);
    if (updateData.experience) updateData.experience = parseInt(updateData.experience);

    // Handle password
    if (updateData.password && updateData.password === '********') {
      delete updateData.password;
    }

    const updatedPandit = await Pandit.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    console.log(`✅ Pandit updated: ${updatedPandit.name}`);
    
    res.json({
      success: true,
      message: 'Pandit updated successfully',
      pandit: updatedPandit
    });
    
  } catch (error) {
    console.error('❌ Error updating pandit:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// FIND the deletePandit function - REMOVE the local file deletion code
exports.deletePandit = async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);
    
    if (!pandit) {
      return res.status(404).json({ message: 'Pandit not found' });
    }

    // ✅ REMOVE this local file deletion code (not needed with Cloudinary)
    // if (pandit.image && !pandit.image.includes('/images/icon.png')) {
    //   const filename = pandit.image.split('/').pop();
    //   const imagePath = path.join('uploads', 'pandits', filename);
    //   if (fs.existsSync(imagePath)) {
    //     fs.unlinkSync(imagePath);
    //   }
    // }

    await Pandit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pandit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
