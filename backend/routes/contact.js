const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Contact form submission - requires authentication
router.post('/', protect, [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('subject').notEmpty().withMessage('Subject is required').trim(),
  body('message').isLength({ min: 3 }).withMessage('Message must be at least 3 characters').trim()
], async (req, res) => {
  try {
    console.log('Contact form received:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message } = req.body;

    // Generate reference number
    const reference = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Determine priority based on subject
    let priority = 'medium';
    if (subject === 'complaint') priority = 'high';
    if (subject === 'billing') priority = 'high';
    if (subject === 'support') priority = 'medium';
    if (subject === 'partnership') priority = 'low';

    // Save to database
    const contactMessage = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      reference,
      priority,
      tags: [subject]
    });

    await contactMessage.save();

    console.log('Contact Form Submission saved:', {
      reference,
      name,
      email,
      subject,
      priority
    });

    res.json({
      success: true,
      message: 'Message sent successfully!',
      reference
    });

  } catch (error) {
    console.error('Contact form error:', error);
    console.error('Error details:', error.message);
    console.error('Request body:', req.body);
    res.status(500).json({
      success: false,
      message: 'Error processing your message. Please try again.',
      error: error.message
    });
  }
});

// Admin routes for customer support

// Get all contact messages with filtering and pagination
router.get('/admin/messages', protect, authorize('admin', 'staff', 'customer'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      subject,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = subject;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Contact.find(filter)
        .populate('assignedTo', 'firstName lastName email')
        .populate('responses.adminId', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Contact.countDocuments(filter)
    ]);

    // Get summary statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      new: 0,
      'in-progress': 0,
      resolved: 0,
      closed: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        stats: statusCounts
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// Get single contact message
router.get('/admin/messages/:id', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('responses.adminId', 'firstName lastName');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message'
    });
  }
});

// Update contact message (status, priority, assignment, tags)
router.put('/admin/messages/:id', protect, authorize('admin', 'staff'), [
  body('status').optional().isIn(['new', 'in-progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('assignedTo').optional().isMongoId(),
  body('tags').optional().isArray(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { status, priority, assignedTo, tags, notes } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (tags) updateData.tags = tags;

    // Find the message first to add status update note
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Add status update note as internal response if notes provided or status changed
    if (notes || status) {
      const statusNote = notes ? notes : `Status updated to ${status || message.status}`;
      const adminName = `${req.user.firstName} ${req.user.lastName}`;

      message.responses.push({
        adminId: req.user._id,
        adminName: adminName,
        message: statusNote,
        isInternal: true,
        timestamp: new Date()
      });
    }

    // Apply updates
    Object.assign(message, updateData);
    await message.save();

    // Populate and return updated message
    const updatedMessage = await Contact.findById(message._id).populate('assignedTo', 'firstName lastName email');

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating message'
    });
  }
});

// Add response to contact message
router.post('/admin/messages/:id/responses', protect, authorize('admin', 'staff'), [
  body('message').notEmpty().withMessage('Response message is required').trim(),
  body('isInternal').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { message: responseMessage, isInternal = false } = req.body;
    const adminName = `${req.user.firstName} ${req.user.lastName}`;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Add response
    contact.responses.push({
      adminId: req.user.id,
      adminName,
      message: responseMessage,
      isInternal
    });

    // Update status to in-progress if it was new
    if (contact.status === 'new') {
      contact.status = 'in-progress';
    }

    // Set customerNotified flag if not internal
    if (!isInternal) {
      contact.customerNotified = true;
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response'
    });
  }
});

// Delete contact message
router.delete('/admin/messages/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
});

// Delete specific internal response
router.delete('/admin/messages/:id/responses/:responseId', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { id, responseId } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Find the response to delete
    const responseIndex = contact.responses.findIndex(r => r._id.toString() === responseId);
    if (responseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if it's an internal response (only allow deleting internal responses)
    const response = contact.responses[responseIndex];
    if (!response.isInternal) {
      return res.status(403).json({
        success: false,
        message: 'Can only delete internal responses'
      });
    }

    // Remove the response
    contact.responses.splice(responseIndex, 1);
    await contact.save();

    // Return updated contact with populated data
    const updatedContact = await Contact.findById(id).populate('assignedTo', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Internal response deleted successfully',
      data: updatedContact
    });

  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting response'
    });
  }
});

module.exports = router;