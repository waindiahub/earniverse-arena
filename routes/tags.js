const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all tags
router.get('/', auth, async (req, res) => {
  try {
    const [tags] = await db.execute(
      'SELECT * FROM tags ORDER BY name ASC'
    );
    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create new tag (admin only)
router.post('/', [
  auth,
  adminOnly,
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('color').matches(/^#[0-9A-F]{6}$/i)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, color } = req.body;

    await db.execute(
      'INSERT INTO tags (name, color) VALUES (?, ?)',
      [name, color]
    );

    res.status(201).json({ message: 'Tag created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tag name already exists' });
    }
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Update tag (admin only)
router.put('/:id', [
  auth,
  adminOnly,
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, color } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (color !== undefined) {
      updateFields.push('color = ?');
      updateValues.push(color);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);

    const [result] = await db.execute(
      `UPDATE tags SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ message: 'Tag updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tag name already exists' });
    }
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// Delete tag (admin only)
router.delete('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM tags WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

module.exports = router;