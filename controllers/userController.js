const pool = require('../db/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
  const { username, password, name } = req.body;

  // Validate all required fields
  if (!username || !password || !name) {
    return res.status(400).send('Username, password, and name are required');
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const [result] = await pool.query(
      'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
      [username, hashedPassword, name]
    );

    res.status(201).send(`User added with ID: ${result.insertId}`);
    console.log(`User added with ID: ${result.insertId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create user');
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM users');
    res.json(results); // Send all users data as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to retrieve users');
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Validate all required fields
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    // Retrieve the user from the database
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).send('Invalid username or password');
    }

    const user = rows[0];

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send('Invalid username or password');
    }

    // Generate a JWT token without an expiration time
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to authenticate user');
  }
};

const findUserByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).send('Name query parameter is required');
  }

  try {
    const [results] = await pool.query('SELECT name, username FROM users WHERE name LIKE ?', [`%${name}%`]);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to find users by name');
  }
};

const followUser = async (req, res) => {
  const { followingId } = req.body;
  const followerId = req.user && req.user.id; 

  try {
    if (!followerId) {
      return res.status(401).send('Unauthorized: Missing or invalid user information');
    }

    if (!followingId) {
      return res.status(400).send('Following ID is required');
    }

    // Insert into the followers table with valid follower_id
    const [result] = await pool.query('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
    res.status(201).send(`You are now following user with ID: ${followingId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to follow user');
  }
};


module.exports = {
  createUser,
  getAllUsers,
  loginUser,
  findUserByName,
  followUser,
};
