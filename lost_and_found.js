const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true,
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: 150,
  },
  contact: {
    type: String,
    trim: true,
    maxlength: 20,
  },
  status: {
    type: String,
    enum: ['open', 'found', 'resolved'],
    default: 'open',
  },
  dateOccurred: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Auto-set status for found items
lostFoundSchema.pre('save', function (next) {
  if (this.isNew && this.type === 'found' && this.status === 'open') {
    this.status = 'found';
  }
  next();
});

module.exports = mongoose.model('LostFound', lostFoundSchema);