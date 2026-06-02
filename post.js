const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['update', 'event', 'lost', 'issue'],
    required: true,
    default: 'update',
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [280, 'Post cannot exceed 280 characters'],
    trim: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// ── Virtual: like count ──
postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});
postSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

module.exports = mongoose.model('Post', postSchema);