const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'FR' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  sender: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'USA' }
    }
  },
  recipient: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'USA' }
    }
  },
  package: {
    weight: { type: Number, required: true, min: 0.1 },
    dimensions: {
      length: { type: Number, required: true, min: 1 },
      width: { type: Number, required: true, min: 1 },
      height: { type: Number, required: true, min: 1 }
    },
    description: { type: String, required: true, maxlength: 500 },
    value: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['documents', 'electronics', 'clothing', 'books', 'fragile', 'other'],
      default: 'other'
    }
  },
  service: {
    type: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'international'],
      required: true
    },
    cost: { type: Number, required: true, min: 0 },
    estimatedDelivery: { type: Date, required: true },
    insurance: { type: Boolean, default: false },
    signature: { type: Boolean, default: false }
  },
  status: {
    current: {
      type: String,
      enum: ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned'],
      default: 'pending'
    },
    history: [{
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned']
      },
      location: String,
      timestamp: { type: Date, default: Date.now },
      description: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      transportationType: {
        type: String,
        enum: {
          values: ['truck', 'plane', 'ship', 'train', 'van', 'motorcycle', 'warehouse'],
          message: '{VALUE} is not a valid transportation type'
        },
        required: false,
        default: undefined
      },
      vehicleId: String,
      estimatedArrival: Date,
      isHeld: { type: Boolean, default: false },
      holdReason: String
    }]
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
      required: true
    },
    transactionId: String,
    paidAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
shipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add status to history when status changes
shipmentSchema.pre('save', function(next) {
  if (this.isModified('status.current')) {
    const getStatusDescription = (status) => {
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

    this.status.history.push({
      status: this.status.current,
      timestamp: new Date(),
      description: getStatusDescription(this.status.current)
    });
  }
  next();
});

// Index for efficient queries
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ 'sender.userId': 1 });
shipmentSchema.index({ 'status.current': 1 });
shipmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Shipment', shipmentSchema);