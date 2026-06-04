const express = require('express');
const router  = express.Router();
const Issue   = require('../models/Issue');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/issues
 * Get all issues (paginated, filtered). Public.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const page     = Math.max(parseInt(req.query.page) || 1, 1);
    const limit    = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip     = (page - 1) * limit;
    const category = req.query.category;
    const status   = req.query.status;
    const priority = req.query.priority;
    const search   = req.query.search;

    const query = {};
    if (category && ['wifi','electrical','plumbing','classroom','hostel','canteen','other'].includes(category)) {
      query.category = category;
    }
    if (status   && ['open','inprogress','resolved'].includes(status))   query.status   = status;
    if (priority && ['low','medium','high'].includes(priority))           query.priority = priority;
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location:    { $regex: search, $options: 'i' } },
      ];
    }

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('author', 'name branch')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: issues,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/issues/stats
 * Summary counts for dashboard. Public.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [open, inprogress, resolved, total] = await Promise.all([
      Issue.countDocuments({ status: 'open' }),
      Issue.countDocuments({ status: 'inprogress' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments(),
    ]);
    res.json({ success: true, data: { open, inprogress, resolved, total } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/issues
 * Report a new issue. Requires auth.
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { category, title, description, location, priority } = req.body;

    if (!title?.trim() || !location?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and location are required.' });
    }

    const issue = await Issue.create({
      author: req.user._id,
      category: category || 'other',
      title: title.trim(),
      description: description?.trim() || '',
      location: location.trim(),
      priority: priority || 'medium',
    });

    const populated = await issue.populate('author', 'name branch');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(' ') });
    }
    next(err);
  }
});

/**
 * PATCH /api/issues/:id/upvote
 * Toggle upvote on an issue. Requires auth.
 */
router.patch('/:id/upvote', protect, async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });

    const userId    = req.user._id.toString();
    const hasVoted  = issue.upvotes.some(id => id.toString() === userId);

    if (hasVoted) {
      issue.upvotes.pull(req.user._id);
    } else {
      issue.upvotes.push(req.user._id);
      // Auto-escalate priority if upvotes cross threshold
      if (issue.upvotes.length >= 20 && issue.priority === 'low')    issue.priority = 'medium';
      if (issue.upvotes.length >= 50 && issue.priority === 'medium') issue.priority = 'high';
    }

    await issue.save();
    res.json({ success: true, upvoted: !hasVoted, upvoteCount: issue.upvotes.length });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/issues/:id/status
 * Update issue status. Admin/moderator only.
 */
router.patch('/:id/status', protect, restrictTo('admin', 'moderator'), async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    if (!['open', 'inprogress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });

    issue.status = status;
    if (adminNote) issue.adminNote = adminNote.trim();
    await issue.save();

    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/issues/:id
 * Delete own issue or admin.
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });

    const isOwner = issue.author.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    await issue.deleteOne();
    res.json({ success: true, message: 'Issue deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;