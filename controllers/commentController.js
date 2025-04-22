// commentController.js

const pool = require('../db/config');

// Get comments for a specific post
const getCommentsForPost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const [comments] = await pool.query('SELECT * FROM comments WHERE post_id = ?', [postId]);
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch comments for post');
  }
};

// Create a comment
const createCommentForPost = async (req, res) => {
  const { postId, content } = req.body;
  const userId = req.user.id; // Get the user ID from the authenticated user

  try {
    // Check if postId and content are provided
    if (!postId || !content) {
      return res.status(400).send('Post ID and content are required');
    }

    // Insert the comment into the database with the user ID
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );

    res.status(201).send(`Comment added with ID: ${result.insertId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create comment');
  }
};


// Delete a comment
const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    await pool.query('DELETE FROM comments WHERE comment_id = ?', [commentId]);
    res.status(200).send('Comment deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to delete comment');
  }
};

module.exports = {
  getCommentsForPost,
  createCommentForPost,
  deleteComment,
};
