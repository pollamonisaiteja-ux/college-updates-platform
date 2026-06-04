const express = require('express');
const router  = express.Router();
const Post    = require('../models/Post');
const { protect, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/posts
 * Get all posts (paginated). Public route.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const type  = req.query.type;
    const skip  = (page - 1) * limit;

    const query = { isActive: true };
    if (type && ['update', 'event', 'lost', 'issue'].includes(type)) query.type = type;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name branch role')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/posts
 * Create a new post. Requires authentication.
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { type, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required.' });
    }

    const post = await Post.create({
      author: req.user._id,
      type: type || 'update',
      content: content.trim(),
    });

    // Increment user post count
    await req.user.updateOne({ $inc: { postCount: 1 } });

    const populated = await post.populate('author', 'name branch role');
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
 * PATCH /api/posts/:id/like
 * Toggle like on a post. Requires authentication.
 */
router.patch('/:id/like', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const userId   = req.user._id.toString();
    const hasLiked = post.likes.some(id => id.toString() === userId);

    if (hasLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    res.json({ success: true, liked: !hasLiked, likeCount: post.likes.length });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/posts/:id/comments
 * Add a comment to a post. Requires authentication.
 */
router.post('/:id/comments', protect, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.comments.push({ author: req.user._id, content: content.trim() });
    await post.save();
    await post.populate('comments.author', 'name branch');

    res.status(201).json({ success: true, data: post.comments[post.comments.length - 1] });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/posts/:id
 * Delete own post (or admin can delete any).
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this post.' });
    }

    post.isActive = false;
    await post.save();

    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;