require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const commentController = require('./controllers/commentController');
const likeController = require('./controllers/likeController');
const authenticateToken = require('./middleware/authMiddleware');

app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Media REST API',
      version: '1.0.0',
      description: 'REST API documentation for a basic social media application'
    },
    servers: [
      {
        url: 'https://social-media-backend-piyush.onrender.com'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    
  },
  apis: ['./app.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - name
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
app.post('/users', userController.createUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.post('/users/login', userController.loginUser);

app.use(authenticateToken);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Find users by name
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The name to search for
 *     responses:
 *       200:
 *         description: Users found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.get('/users/search', userController.findUserByName);

/**
 * @swagger
 * /users/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Followed user successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.post('/users/follow', userController.followUser);

/**
 * @swagger
 * /posts/feed:
 *   get:
 *     summary: Get posts from followed users or from current user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.get('/posts/feed', postController.getFeedPosts);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the post
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.post('/posts', postController.createPost);

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to delete
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *       403:
 *         description: Unauthorized as you're not the user
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
app.delete('/posts/:postId', postController.removePost);

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     summary: Get comments for a specific post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.get('/posts/:postId/comments', commentController.getCommentsForPost);

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Create a new comment for a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.post('/posts/:postId/comments', commentController.createCommentForPost);

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.delete('/comments/:commentId', commentController.deleteComment);

/**
 * @swagger
 * /likes:
 *   post:
 *     summary: Create a like for a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Like created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.post('/likes', likeController.createLikeForPost);

/**
 * @swagger
 * /likes/{postId}:
 *   delete:
 *     summary: Remove a like from a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the post to unlike
 *     responses:
 *       200:
 *         description: Like removed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.delete('/likes/:postId', likeController.removeLikeFromPost);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

