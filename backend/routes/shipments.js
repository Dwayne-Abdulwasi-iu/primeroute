const express = require('express');
const { body, validationResult } = require('express-validator');
const Shipment = require('../models/Shipment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Calculate shipping rates - requires authentication
router.post('/calculate-rate', protect, [
  body('weight').isFloat({ min: 0.1 }).withMessage('Weight must be at least 0.1 lbs'),
  body('dimensions.length').isFloat({ min: 1 }).withMessage('Length must be at least 1 inch'),
  body('dimensions.width').isFloat({ min: 1 }).withMessage('Width must be at least 1 inch'),
  body('dimensions.height').isFloat({ min: 1 }).withMessage('Height must be at least 1 inch'),
  body('senderZip').isPostalCode('US').withMessage('Please provide a valid sender zip code'),
  body('recipientZip').isPostalCode('US').withMessage('Please provide a valid recipient zip code'),
  body('service').isIn(['standard', 'express', 'overnight', 'international']).withMessage('Please select a valid service type')
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

    const { weight, dimensions, senderZip, recipientZip, service, value } = req.body;

    // Calculate dimensional weight
    const dimensionalWeight = (dimensions.length * dimensions.width * dimensions.height) / 166;
    const chargeableWeight = Math.max(weight, dimensionalWeight);

    // Base rates by service type
    const baseRates = {
      standard: 99.99,
      express: 199.99,
      overnight: 299.99,
      international: 499.99
    };

    // Calculate distance-based multiplier (simplified)
    const zipDistance = Math.abs(parseInt(senderZip) - parseInt(recipientZip));
    const distanceMultiplier = 1 + (zipDistance / 100000);

    // Calculate cost
    let cost = baseRates[service] * chargeableWeight * distanceMultiplier;

    // Add insurance if value is high
    if (value > 100) {
      cost += value * 0.01; // 1% insurance
    }

    // Round to 2 decimal places
    cost = Math.round(cost * 100) / 100;

    // Calculate estimated delivery
    const deliveryDays = {
      standard: 5,
      express: 2,
      overnight: 1,
      international: 10
    };

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays[service]);

    res.json({
      success: true,
      rate: {
        service,
        cost,
        chargeableWeight,
        estimatedDelivery,
        details: {
          baseRate: baseRates[service],
          weightUsed: chargeableWeight,
          distanceMultiplier: Math.round(distanceMultiplier * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('Rate calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating shipping rate'
    });
  }
});

// Create a new shipment
router.post('/create', protect, [
  body('recipient.name').notEmpty().withMessage('Recipient name is required'),
  body('recipient.email').isEmail().withMessage('Valid recipient email is required'),
  body('recipient.phone').notEmpty().withMessage('Recipient phone is required'),
  body('recipient.address.street').notEmpty().withMessage('Recipient street address is required'),
  body('recipient.address.city').notEmpty().withMessage('Recipient city is required'),
  body('recipient.address.state').notEmpty().withMessage('Recipient state is required'),
  body('recipient.address.zipCode').notEmpty().withMessage('Recipient ZIP code is required'),
  body('package.weight').isFloat({ min: 0.1 }).withMessage('Package weight is required'),
  body('package.value').isFloat({ min: 0 }).withMessage('Package value is required'),
  body('package.dimensions.length').isFloat({ min: 1 }).withMessage('Package length is required'),
  body('package.dimensions.width').isFloat({ min: 1 }).withMessage('Package width is required'),
  body('package.dimensions.height').isFloat({ min: 1 }).withMessage('Package height is required'),
  body('package.description').isLength({ min: 5, max: 500 }).withMessage('Package description must be 5-500 characters'),
  body('service.type').isIn(['standard', 'express', 'overnight', 'international']).withMessage('Valid service type is required'),
  body('service.estimatedDelivery').isISO8601().withMessage('Valid estimated delivery date is required'),
  body('payment.method').isIn(['credit_card', 'debit_card', 'paypal', 'cash']).withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    console.log('Shipment creation request body:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const shipmentData = {
      ...req.body,
      sender: {
        userId: req.user._id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address
      }
    };

    const shipment = await Shipment.create(shipmentData);

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      shipment: {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status.current,
        service: shipment.service,
        estimatedDelivery: shipment.service.estimatedDelivery
      }
    });

  } catch (error) {
    console.error('Shipment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shipment'
    });
  }
});

// Get user's shipments
router.get('/my-shipments', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let filter = { 'sender.userId': req.user._id };
    if (status) {
      filter['status.current'] = status;
    }

    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('trackingNumber recipient package service status createdAt payment');

    const total = await Shipment.countDocuments(filter);

    res.json({
      success: true,
      shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments'
    });
  }
});

// Get single shipment details
router.get('/shipment/:id', protect, async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      'sender.userId': req.user._id
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      shipment
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipment details'
    });
  }
});

// Cancel shipment (only if pending or confirmed)
router.put('/shipment/:id/cancel', protect, async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      'sender.userId': req.user._id
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    if (!['pending', 'confirmed'].includes(shipment.status.current)) {
      return res.status(400).json({
        success: false,
        message: 'Shipment cannot be cancelled at this stage'
      });
    }

    shipment.status.current = 'returned';
    shipment.status.history.push({
      status: 'returned',
      timestamp: new Date(),
      description: 'Shipment cancelled by customer',
      location: 'Customer Request'
    });

    await shipment.save();

    res.json({
      success: true,
      message: 'Shipment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling shipment'
    });
  }
});

// Get shipping statistics for user
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const stats = await Promise.all([
      Shipment.countDocuments({ 'sender.userId': userId }),
      Shipment.countDocuments({ 'sender.userId': userId, 'status.current': 'delivered' }),
      Shipment.countDocuments({ 'sender.userId': userId, 'status.current': 'in_transit' }),
      Shipment.countDocuments({ 'sender.userId': userId, createdAt: { $gte: currentMonth } }),
      Shipment.aggregate([
        { $match: { 'sender.userId': userId, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$service.cost' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalShipments: stats[0],
        delivered: stats[1],
        inTransit: stats[2],
        thisMonth: stats[3],
        totalSpent: stats[4][0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Validate address - requires authentication
router.post('/validate-address', protect, [
  body('street').notEmpty().withMessage('Street address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zipCode').isPostalCode('US').withMessage('Valid ZIP code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Address validation failed',
        errors: errors.array()
      });
    }

    const { street, city, state, zipCode } = req.body;

    // Simple address validation (in production, use a real address validation service)
    const isValid = street.length > 5 && city.length > 2 && state.length === 2 && zipCode.match(/^\d{5}$/);

    res.json({
      success: true,
      valid: isValid,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.toUpperCase(),
        zipCode: zipCode
      },
      suggestions: isValid ? null : [
        'Please verify the street address',
        'Ensure state is a 2-letter code',
        'ZIP code should be 5 digits'
      ]
    });
  } catch (error) {
    console.error('Address validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating address'
    });
  }
});

// Update shipment status (admin only)
router.put('/admin/update-status/:trackingNumber', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { status, location, description, transportationType, vehicleId, estimatedArrival, isHeld, holdReason } = req.body;

    console.log('Admin status update:', { trackingNumber: req.params.trackingNumber, ...req.body });

    const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Update current status
    shipment.status.current = status;

    // Create detailed status entry
    const getDefaultDescription = (status) => {
      const descriptions = {
        'pending': 'Shipment is pending processing',
        'confirmed': 'Shipment status awaiting confirmation',
        'picked_up': 'Package has been picked up from sender',
        'in_transit': 'Package is in transit to destination',
        'out_for_delivery': 'Package is out for delivery',
        'delivered': 'Package has been successfully delivered',
        'exception': 'Delivery exception occurred',
        'returned': 'Package is being returned to sender'
      };
      return descriptions[status] || `Status updated to ${status}`;
    };

    const statusUpdate = {
      status,
      location: location || 'Processing Center',
      description: description || getDefaultDescription(status),
      updatedBy: req.user._id,
      timestamp: new Date(),
      transportationType: transportationType || undefined,
      vehicleId: vehicleId || undefined,
      estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
      isHeld: isHeld || false,
      holdReason: holdReason || undefined
    };

    // Add to history
    shipment.status.history.push(statusUpdate);

    await shipment.save();

    res.json({
      success: true,
      message: 'Shipment status updated successfully',
      shipment: {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        recipient: shipment.recipient,
        updatedAt: shipment.updatedAt
      }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shipment status'
    });
  }
});

// Get all shipments for admin management
router.get('/admin/all-shipments', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    let filter = {};
    if (status && status !== 'all') {
      filter['status.current'] = status;
    }

    if (search) {
      filter.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } },
        { 'recipient.email': { $regex: search, $options: 'i' } }
      ];
    }

    const shipments = await Shipment.find(filter)
      .populate('sender.userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('trackingNumber recipient package service status payment createdAt updatedAt');

    const total = await Shipment.countDocuments(filter);

    res.json({
      success: true,
      shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments'
    });
  }
});

module.exports = router;