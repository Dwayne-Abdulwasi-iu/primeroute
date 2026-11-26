const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        enum: ['general', 'support', 'billing', 'complaint', 'partnership']
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'in-progress', 'resolved', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    responses: [{
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        adminName: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        isInternal: {
            type: Boolean,
            default: false
        }
    }],
    reference: {
        type: String,
        unique: true,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    customerNotified: {
        type: Boolean,
        default: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update lastActivity on save
contactSchema.pre('save', function(next) {
    this.lastActivity = new Date();
    next();
});

// Generate priority score for sorting
contactSchema.virtual('priorityScore').get(function() {
    const priorityScores = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityScores[this.priority] || 2;
});

module.exports = mongoose.model('Contact', contactSchema);