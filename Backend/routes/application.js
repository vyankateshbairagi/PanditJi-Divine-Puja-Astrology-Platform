// backend/routes/application.js
const express = require('express');
const router = express.Router();
const PanditApplication = require('../models/PanditApplication');
const { authenticateAdmin, isAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email to applicant
const sendApplicationStatusEmail = async (email, name, status, notes = null) => {
  try {
    const subject = status === 'approved' 
      ? 'Congratulations! Your Pandit Application is Approved' 
      : 'Update on Your Pandit Application';
    
    const html = status === 'approved'
      ? `
        <!DOCTYPE html>
        <html>
        <head><style>body{font-family:Arial,sans-serif;}</style></head>
        <body>
          <h2>Dear ${name},</h2>
          <p>Congratulations! Your application to become a Pandit at <strong>PanditJi</strong> has been <strong style="color:green">APPROVED</strong>.</p>
          <p>You will receive your login credentials via email shortly. Our admin team will create your account and send you the details.</p>
          <p>Thank you for joining PanditJi!</p>
          <br/>
          <p>Best regards,<br/>Pujanam Team</p>
        </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
        <head><style>body{font-family:Arial,sans-serif;}</style></head>
        <body>
          <h2>Dear ${name},</h2>
          <p>Thank you for your interest in becoming a Pandit at <strong>PanditJi</strong>.</p>
          <p>After careful review, your application has been <strong style="color:orange">${status.toUpperCase()}</strong>.</p>
          ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
          <p>If you have any questions, please contact our support team.</p>
          <br/>
          <p>Best regards,<br/>PanditJi Team</p>
        </body>
        </html>
      `;
    
    await transporter.sendMail({
      from: `"PanditJi Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html
    });
    
    console.log(`✅ Status email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Public route - Submit application
router.post('/submit', async (req, res) => {
  try {
    const { name, mobile, email, qualification, pujaTypes, experience, aadhar } = req.body;
    
    // Validate required fields
    if (!name || !mobile || !email || !qualification || !pujaTypes || !experience || !aadhar) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number'
      });
    }
    
    // Validate email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Validate Aadhar (12 digits)
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadhar)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 12-digit Aadhar number'
      });
    }
    
    // Validate experience
    if (experience < 0 || experience > 50) {
      return res.status(400).json({
        success: false,
        message: 'Please enter valid years of experience (0-50)'
      });
    }
    
    // Check for existing applications with same email, mobile, or aadhar
    const existingEmail = await PanditApplication.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An application with this email already exists'
      });
    }
    
    const existingMobile = await PanditApplication.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'An application with this mobile number already exists'
      });
    }
    
    const existingAadhar = await PanditApplication.findOne({ aadhar });
    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: 'An application with this Aadhar number already exists'
      });
    }
    
    // Create new application
    const application = new PanditApplication({
      name,
      mobile,
      email,
      qualification,
      pujaTypes,
      experience: parseInt(experience),
      aadhar
    });
    
    await application.save();
    
    console.log(`📝 New pandit application received: ${name} (${email})`);
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our admin team will review your application and contact you soon.'
    });
    
  } catch (error) {
    console.error('Application submission error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}.`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Admin routes - Get all applications
router.get('/applications', authenticateAdmin, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    console.log('📋 Fetching applications with filter:', status);
    
    // Build query - handle 'all' case properly
    let query = {};
    if (status && status !== 'all' && status !== 'undefined') {
      query.status = status;
    }
    
    console.log('   Query:', query);
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const applications = await PanditApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await PanditApplication.countDocuments(query);
    
    // Get counts for each status (for stats)
    const stats = {
      total: await PanditApplication.countDocuments(),
      pending: await PanditApplication.countDocuments({ status: 'pending' }),
      approved: await PanditApplication.countDocuments({ status: 'approved' }),
      rejected: await PanditApplication.countDocuments({ status: 'rejected' })
    };
    
    console.log(`✅ Found ${applications.length} applications`);
    console.log(`   Stats: Pending:${stats.pending}, Approved:${stats.approved}, Rejected:${stats.rejected}`);
    
    res.json({
      success: true,
      applications,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin route - Get single application
router.get('/applications/:id', authenticateAdmin, isAdmin, async (req, res) => {
  try {
    const application = await PanditApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      application
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin route - Approve application
router.post('/applications/:id/approve', authenticateAdmin, isAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const application = await PanditApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`
      });
    }
    
    application.status = 'approved';
    application.adminNotes = adminNotes || null;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();
    
    // Send approval email
    await sendApplicationStatusEmail(application.email, application.name, 'approved', adminNotes);
    
    console.log(`✅ Application approved: ${application.name}`);
    
    res.json({
      success: true,
      message: 'Application approved successfully. Email sent to applicant.',
      application
    });
    
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin route - Reject application
router.post('/applications/:id/reject', authenticateAdmin, isAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const application = await PanditApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`
      });
    }
    
    application.status = 'rejected';
    application.adminNotes = adminNotes || null;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();
    
    // Send rejection email
    await sendApplicationStatusEmail(application.email, application.name, 'rejected', adminNotes);
    
    console.log(`❌ Application rejected: ${application.name}`);
    
    res.json({
      success: true,
      message: 'Application rejected. Email sent to applicant.',
      application
    });
    
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin route - Delete application
router.delete('/applications/:id', authenticateAdmin, isAdmin, async (req, res) => {
  try {
    const application = await PanditApplication.findByIdAndDelete(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;