const express = require('express');
const { param, validationResult } = require('express-validator');
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Track shipment by tracking number - requires authentication
router.get('/:trackingNumber', protect, [
  param('trackingNumber').isLength({ min: 8, max: 20 }).withMessage('Invalid tracking number format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tracking number format',
        errors: errors.array()
      });
    }

    const { trackingNumber } = req.params;

    const shipment = await Shipment.findOne({ trackingNumber })
      .select('trackingNumber sender.name recipient package service status createdAt updatedAt');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Tracking number not found'
      });
    }

    // Calculate progress percentage
    const statusOrder = ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(shipment.status.current);
    const progress = currentIndex >= 0 ? Math.round(((currentIndex + 1) / statusOrder.length) * 100) : 0;

    // Format response
    const trackingInfo = {
      trackingNumber: shipment.trackingNumber,
      status: {
        current: shipment.status.current,
        progress,
        history: shipment.status.history.map(entry => ({
          status: entry.status,
          location: entry.location,
          timestamp: entry.timestamp,
          description: entry.description,
          transportationType: entry.transportationType,
          vehicleId: entry.vehicleId,
          estimatedArrival: entry.estimatedArrival,
          isHeld: entry.isHeld,
          holdReason: entry.holdReason
        }))
      },
      service: {
        type: shipment.service.type,
        estimatedDelivery: shipment.service.estimatedDelivery
      },
      package: {
        description: shipment.package.description,
        weight: shipment.package.weight
      },
      recipient: {
        name: shipment.recipient.name,
        city: shipment.recipient.address.city,
        state: shipment.recipient.address.state
      },
      dates: {
        created: shipment.createdAt,
        lastUpdated: shipment.updatedAt
      }
    };

    res.json({
      success: true,
      tracking: trackingInfo
    });

  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving tracking information'
    });
  }
});

// Get tracking updates for multiple packages (for authenticated users)
router.post('/bulk-track', protect, async (req, res) => {
  try {
    const { trackingNumbers } = req.body;

    if (!Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of tracking numbers'
      });
    }

    if (trackingNumbers.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 tracking numbers allowed per request'
      });
    }

    const shipments = await Shipment.find({
      trackingNumber: { $in: trackingNumbers }
    }).select('trackingNumber status service.estimatedDelivery recipient.name');

    const results = trackingNumbers.map(trackingNumber => {
      const shipment = shipments.find(s => s.trackingNumber === trackingNumber);

      if (!shipment) {
        return {
          trackingNumber,
          found: false,
          message: 'Shipment not found'
        };
      }

      return {
        trackingNumber,
        found: true,
        status: shipment.status.current,
        estimatedDelivery: shipment.service.estimatedDelivery,
        recipientName: shipment.recipient.name
      };
    });

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Bulk tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk tracking request'
    });
  }
});

module.exports = router;