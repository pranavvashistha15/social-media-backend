const pool = require('../db/config');

// Create a new like for a post
const createLikeForPost = async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.id; // Get the user ID from the authenticated user

  try {
    // Check if postId is provided
    if (!postId) {
      return res.status(400).send('Post ID is required');
    }

    // Check if the user has already liked the post
    const [existingLikes] = await pool.query(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existingLikes.length > 0) {
      return res.status(400).send('You have already liked this post');
    }

    // Insert the like into the database
    await pool.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);

    res.status(201).send('Like created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create like');
  }
};

// Remove a like from a post
const removeLikeFromPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // Get the user ID from the authenticated user

  try {
    // Delete the like from the database
    await pool.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);

    res.status(200).send('Like removed successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to remove like');
  }
};

module.exports = {
  createLikeForPost,
  removeLikeFromPost,
};
