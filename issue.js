const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['wifi', 'electrical', 'plumbing', 'classroom', 'hostel', 'canteen', 'other'],
    required: true,
    default: 'other',
  },
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: 150,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 800,
    default: '',
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: 150,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'inprogress', 'resolved'],
    default: 'open',
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  adminNote: {
    type: String,
    trim: true,
    maxlength: 300,
    default: '',
  },
  resolvedAt: { type: Date },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

issueSchema.virtual('upvoteCount').get(function () {
  return this.upvotes.length;
});

// When status changes to resolved, stamp the time
issueSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);