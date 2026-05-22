// backend/routes/astroConsultation.js  — FULL UPDATED FILE
// Includes original paid-consultation routes PLUS new free-service routes

const express = require('express');
const router  = express.Router();
const AstroConsultation = require('../models/AstroConsultation');
const FreeAstroRequest  = require('../models/FreeAstroRequest');
const { authenticateCustomer, authenticatePandit, authenticateAdmin } = require('../middleware/auth');


// GET - Fetch Birth Chart (Kundali) - Real-time API call
router.post('/fetch-birth-chart', authenticateCustomer, async (req, res) => {
  try {
    const { birthDetails, requestId } = req.body;
    
    if (!birthDetails || !birthDetails.dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Birth details are required'
      });
    }
    
    // Fetch from external API
    const result = await astrologyApiService.getBirthChart(birthDetails);
    
    if (result.success) {
      // Update the free request with the fetched data
      if (requestId) {
        await FreeAstroRequest.findByIdAndUpdate(requestId, {
          status: 'delivered',
          deliveredAt: new Date(),
          adminNotes: 'Birth chart generated via API'
        });
      }
      
      res.json({
        success: true,
        data: result.data,
        source: result.source,
        message: 'Birth chart generated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to generate birth chart'
      });
    }
  } catch (error) {
    console.error('Birth chart fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET - Fetch Daily Horoscope (Cached 24 hours)
router.get('/daily-horoscope/:rashi', authenticateCustomer, async (req, res) => {
  try {
    const { rashi } = req.params;
    const { date } = req.query;
    
    const result = await astrologyApiService.getDailyHoroscope(rashi, date);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        source: result.source,
        cachedUntil: result.cachedUntil,
        message: result.source === 'cache' ? 'From cache' : 'Fresh from API'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch horoscope'
      });
    }
  } catch (error) {
    console.error('Horoscope fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Pre-fetch tomorrow's horoscopes (call this via cron job)
router.post('/admin/prefetch-horoscopes', authenticateAdmin, async (req, res) => {
  try {
    const results = await astrologyApiService.preFetchAllHoroscopes();
    res.json({
      success: true,
      message: 'Pre-fetch completed',
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get cache stats
router.get('/admin/cache-stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = astrologyApiService.getCacheStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post('/free-request', authenticateCustomer, async (req, res) => {
  try {
    const {
      serviceType,
      serviceName,
      birthDetails,
      contactEmail,
      contactPhone,
      questions,
      preferWhatsApp,
    } = req.body;

    // Validate serviceType
    if (!['kundli', 'horoscope'].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid free service type. Must be "kundli" or "horoscope".'
      });
    }

    // Validate required birth details
    if (serviceType === 'kundli') {
      if (!birthDetails?.fullName || !birthDetails?.dateOfBirth || !birthDetails?.placeOfBirth) {
        return res.status(400).json({
          success: false,
          message: 'Full name, date of birth, and place of birth are required for Kundali reading.'
        });
      }
    }

    if (serviceType === 'horoscope') {
      if (!birthDetails?.fullName || !birthDetails?.dateOfBirth || !birthDetails?.rashi) {
        return res.status(400).json({
          success: false,
          message: 'Full name, date of birth, and Rashi are required for Daily Horoscope.'
        });
      }
    }

    if (!contactEmail) {
      return res.status(400).json({ success: false, message: 'Contact email is required.' });
    }

    // Prevent duplicate active requests for the same user + serviceType
    const existingActive = await FreeAstroRequest.findOne({
      userId: req.user.id,
      serviceType,
      status: { $in: ['pending', 'processing'] }
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: `You already have an active ${serviceType === 'kundli' ? 'Kundali Reading' : 'Daily Horoscope'} request in progress. We'll deliver it to your email shortly.`
      });
    }

    const request = new FreeAstroRequest({
      userId:       req.user.id,
      userName:     req.user.name,
      userEmail:    req.user.email,
      userPhone:    req.user.phone || contactPhone || null,
      serviceType,
      serviceName:  serviceName || (serviceType === 'kundli' ? 'Basic Birth Chart Reading' : 'Daily Horoscope'),
      birthDetails: {
        fullName:    birthDetails.fullName    || null,
        dateOfBirth: birthDetails.dateOfBirth || null,
        timeOfBirth: birthDetails.timeOfBirth || null,
        placeOfBirth:birthDetails.placeOfBirth|| null,
        rashi:       birthDetails.rashi       || null,
      },
      contactEmail,
      contactPhone: contactPhone || req.user.phone || null,
      preferWhatsApp: preferWhatsApp || false,
      questions: questions || null,
      status: 'pending'
    });

    await request.save();

    // Notify admin / pandits via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('new_free_astro_request', {
        requestId:   request._id,
        serviceType: request.serviceType,
        message: `New free ${request.serviceName} request from ${req.user.name}`
      });
    }

    res.status(201).json({
      success: true,
      message: `Your ${request.serviceName} request has been received. We will deliver it to ${contactEmail} within 24 hours.`,
      request
    });

  } catch (error) {
    console.error('Error creating free astro request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   Customer: Get my free requests
   GET /api/astro-consultation/my-free-requests
   ───────────────────────────────────────────────────────────── */
router.get('/my-free-requests', authenticateCustomer, async (req, res) => {
  try {
    const requests = await FreeAstroRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching free requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   Admin: Get all free requests
   GET /api/astro-consultation/admin/free-requests
   ───────────────────────────────────────────────────────────── */
router.get('/admin/free-requests', authenticateAdmin, async (req, res) => {
  try {
    const { status, serviceType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status)      query.status = status;
    if (serviceType) query.serviceType = serviceType;

    const total = await FreeAstroRequest.countDocuments(query);
    const requests = await FreeAstroRequest.find(query)
      .populate('assignedPanditId', 'name contact')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({ success: true, total, requests });
  } catch (error) {
    console.error('Error fetching free requests (admin):', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   Admin: Update a free request (status, notes, assign pandit)
   PATCH /api/astro-consultation/admin/free-requests/:id
   ───────────────────────────────────────────────────────────── */
router.patch('/admin/free-requests/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, adminNotes, assignedPanditId } = req.body;
    const update = { updatedAt: new Date() };

    if (status) {
      update.status = status;
      if (status === 'delivered') update.deliveredAt = new Date();
    }
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (assignedPanditId !== undefined) update.assignedPanditId = assignedPanditId;

    const request = await FreeAstroRequest.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, message: 'Request updated', request });
  } catch (error) {
    console.error('Error updating free request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════════
   ORIGINAL PAID CONSULTATION ROUTES (unchanged)
   ═══════════════════════════════════════════════════════════════ */

// Customer: Create a consultation request (Paid Service)
router.post('/request', authenticateCustomer, async (req, res) => {
  try {
    const {
      serviceType,
      serviceName,
      preferredTime,
      birthDetails,
      partnerBirthDetails,
      questions
    } = req.body;

    const consultation = new AstroConsultation({
      userId:     req.user.id,
      userName:   req.user.name,
      userEmail:  req.user.email,
      userPhone:  req.user.phone,
      serviceType,
      serviceName,
      preferredTime,
      birthDetails,
      partnerBirthDetails,
      questions,
      status: 'pending',
      paymentStatus: 'pending',
      paymentAmount:
        serviceType === 'kundli' ? 2100 :
        serviceType === 'horoscope' ? 1600 : 2500
    });

    await consultation.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('new_astro_consultation', {
        consultationId: consultation._id,
        message: `New astrology consultation request: ${serviceName}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully',
      consultation
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Pandit: Get available astrology consultations
router.get('/pandit/consultations', authenticatePandit, async (req, res) => {
  try {
    const panditId = req.user.id;
    const { status = 'pending' } = req.query;

    let query = { status: 'pending' };

    if (status === 'accepted') {
      query = { assignedPanditId: panditId, status: 'accepted' };
    } else if (status === 'completed') {
      query = { assignedPanditId: panditId, status: 'completed' };
    }

    const consultations = await AstroConsultation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const consultationsWithNotification = consultations.map(c => ({
      ...c,
      isNotified: c.notifiedPandits?.includes(panditId) || false
    }));

    res.json({ success: true, consultations: consultationsWithNotification });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Pandit: Accept a consultation
router.post('/pandit/consultations/:id/accept', authenticatePandit, async (req, res) => {
  try {
    const consultation = await AstroConsultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }
    if (consultation.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Consultation already accepted' });
    }

    consultation.assignedPanditId = req.user.id;
    consultation.status = 'accepted';
    consultation.assignedAt = new Date();
    consultation.updatedAt = new Date();
    await consultation.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${consultation.userId}`).emit('consultation_accepted', {
        consultationId: consultation._id,
        message: `Your astrology consultation has been accepted by a pandit`
      });
    }

    res.json({ success: true, message: 'Consultation accepted successfully', consultation });
  } catch (error) {
    console.error('Error accepting consultation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Pandit: Complete a consultation
router.patch('/pandit/consultations/:id/complete', authenticatePandit, async (req, res) => {
  try {
    const { consultationNotes } = req.body;

    const consultation = await AstroConsultation.findOne({
      _id: req.params.id,
      assignedPanditId: req.user.id,
      status: 'accepted'
    });

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    consultation.status = 'completed';
    consultation.consultationNotes = consultationNotes;
    consultation.updatedAt = new Date();
    await consultation.save();

    res.json({ success: true, message: 'Consultation marked as completed', consultation });
  } catch (error) {
    console.error('Error completing consultation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Customer: Get my paid consultations
router.get('/my-consultations', authenticateCustomer, async (req, res) => {
  try {
    const consultations = await AstroConsultation.find({ userId: req.user.id })
      .populate('assignedPanditId', 'name contact image')
      .sort({ createdAt: -1 });

    res.json({ success: true, consultations });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;