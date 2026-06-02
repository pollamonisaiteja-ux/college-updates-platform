const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [60, 'Name cannot exceed 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@vitap\.ac\.in$/, 'Must be a valid VIT-AP email (@vitap.ac.in)'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Never return password by default
  },
  registrationNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{3}[0-9]{4}$/, 'Invalid registration number format (e.g. 21BCE7777)'],
  },
  branch: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'moderator'],
    default: 'student',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: 200,
    default: '',
  },
  postCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastSeen:  { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ── Hash password before saving ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare plain password with hash ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Virtual: public profile ──
userSchema.virtual('publicProfile').get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    branch: this.branch,
    role: this.role,
    postCount: this.postCount,
    createdAt: this.createdAt,
  };
});

module.exports = mongoose.model('User', userSchema);