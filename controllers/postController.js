const pool = require('../db/config');

const getFeedPosts = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get IDs of users that the current user follows
    const [followerRows] = await pool.query('SELECT following_id FROM followers WHERE follower_id = ?', [userId]);
    const followingIds = followerRows.map(row => row.following_id);

    let postRows;
    if (followingIds.length === 0) {
      // If the user follows no one, return posts by the user themselves
      [postRows] = await pool.query('SELECT * FROM posts WHERE user_id = ?', [userId]);
    } else {
      // Include the user's own posts in the result
      followingIds.push(userId);
      [postRows] = await pool.query('SELECT * FROM posts WHERE user_id IN (?)', [followingIds]);
    }

    res.json(postRows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch content feed');
  }
};

const createPost = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id; // Assuming user ID is available in the request

  try {
    // Insert the new post into the database
    const result = await pool.query(
      'INSERT INTO posts (user_id, content) VALUES (?, ?)',
      [userId, content]
    );

    // Fetch the newly created post from the database
    const newPostId = result.insertId;
    const [post] = await pool.query('SELECT * FROM posts WHERE post_id = ?', [newPostId]);

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create post');
  }
};

const removePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id; // Assuming user ID is available in the request

  try {
    // Check if the user is the author of the post
    const [post] = await pool.query('SELECT * FROM posts WHERE post_id = ? AND user_id = ?', [postId, userId]);
    if (!post) {
      return res.status(403).send('Unauthorized: You are not the author of this post');
    }

    // Remove the post from the database
    await pool.query('DELETE FROM posts WHERE post_id = ?', [postId]);
    res.status(201).send('Post deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to delete post');
  }
};

module.exports = {
  getFeedPosts,
  createPost,
  removePost,
};
