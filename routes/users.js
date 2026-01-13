const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const { auth, adminOnly } = require('../auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', [auth, adminOnly], async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        u.id, u.email, u.created_at,
        p.full_name, p.avatar_url,
        ur.role
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      ORDER BY u.created_at DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get agents for assignment dropdown
router.get('/agents', auth, async (req, res) => {
  try {
    const [agents] = await db.execute(`
      SELECT 
        u.id as user_id, p.full_name
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role IN ('admin', 'agent')
      ORDER BY p.full_name ASC
    `);

    res.json(agents);
  } catch (error) {
    console.error('Get agents error:', error);
    // Return empty array instead of error to prevent UI breaks
    res.json([]);
  }
});

// Update user role (admin only)
router.put('/:id/role', [
  auth,
  adminOnly,
  body('role').isIn(['admin', 'agent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Check if user exists
    const [users] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role
    await db.execute(
      'UPDATE user_roles SET role = ? WHERE user_id = ?',
      [role, id]
    );

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Create agent (admin only)
router.post('/agents', [
  auth,
  adminOnly,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName } = req.body;

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const [userResult] = await db.execute(
      'INSERT INTO users (email, password_hash, email_confirmed) VALUES (?, ?, ?)',
      [email, passwordHash, true]
    );

    const userId = userResult.insertId;

    // Create profile
    await db.execute(
      'INSERT INTO profiles (user_id, full_name) VALUES (?, ?)',
      [userId, fullName]
    );

    // Assign agent role
    await db.execute(
      'INSERT INTO user_roles (user_id, role) VALUES (?, ?)',
      [userId, 'agent']
    );

    res.status(201).json({ 
      message: 'Agent created successfully',
      user: {
        id: userId,
        email,
        fullName,
        role: 'agent'
      }
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('fullName').optional().trim().isLength({ min: 2 }),
  body('avatarUrl').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, avatarUrl } = req.body;
    const updateFields = [];
    const updateValues = [];

    if (fullName !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(fullName);
    }

    if (avatarUrl !== undefined) {
      updateFields.push('avatar_url = ?');
      updateValues.push(avatarUrl);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(req.user.userId);

    await db.execute(
      `UPDATE profiles SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
