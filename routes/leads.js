const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all leads (with filtering and pagination)
router.get('/', auth, async (req, res) => {
  try {
    const { status, assignedAgent, search, date, dateFrom, dateTo } = req.query;

    let whereClause = '1=1';
    let params = [];

    // Role-based access control
    if (req.user.role !== 'admin') {
      whereClause += ' AND l.assigned_agent_id = ?';
      params.push(req.user.userId);
    }

    // Add filters
    if (status) {
      whereClause += ' AND l.status = ?';
      params.push(status);
    }

    if (assignedAgent) {
      whereClause += ' AND l.assigned_agent_id = ?';
      params.push(assignedAgent);
    }

    if (search) {
      whereClause += ' AND (l.school_name LIKE ? OR l.mobile_number LIKE ? OR l.client_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Date filters
    if (date) {
      if (date === 'today') {
        whereClause += ' AND DATE(l.created_at) = CURDATE()';
      } else {
        whereClause += ' AND DATE(l.created_at) = ?';
        params.push(date);
      }
    }

    if (dateFrom && dateTo) {
      whereClause += ' AND DATE(l.created_at) BETWEEN ? AND ?';
      params.push(dateFrom, dateTo);
    } else if (dateFrom) {
      whereClause += ' AND DATE(l.created_at) >= ?';
      params.push(dateFrom);
    } else if (dateTo) {
      whereClause += ' AND DATE(l.created_at) <= ?';
      params.push(dateTo);
    }

    const [leads] = await db.execute(`
      SELECT 
        l.*,
        p.full_name as agent_name,
        creator.full_name as created_by_name,
        GROUP_CONCAT(DISTINCT t.name) as tag_names,
        GROUP_CONCAT(DISTINCT t.color) as tag_colors
      FROM leads l
      LEFT JOIN profiles p ON l.assigned_agent_id = p.user_id
      LEFT JOIN profiles creator ON l.created_by = creator.user_id
      LEFT JOIN lead_tags lt ON l.id = lt.lead_id
      LEFT JOIN tags t ON lt.tag_id = t.id
      WHERE ${whereClause}
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `, params);

    res.json({
      leads,
      pagination: {
        page: 1,
        limit: leads.length,
        total: leads.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get single lead by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [leads] = await db.execute(`
      SELECT 
        l.*,
        p.full_name as agent_name,
        creator.full_name as created_by_name,
        GROUP_CONCAT(DISTINCT t.name) as tag_names,
        GROUP_CONCAT(DISTINCT t.color) as tag_colors,
        GROUP_CONCAT(DISTINCT t.id) as tag_ids
      FROM leads l
      LEFT JOIN profiles p ON l.assigned_agent_id = p.user_id
      LEFT JOIN profiles creator ON l.created_by = creator.user_id
      LEFT JOIN lead_tags lt ON l.id = lt.lead_id
      LEFT JOIN tags t ON lt.tag_id = t.id
      WHERE l.id = ?
      GROUP BY l.id
    `, [id]);

    if (leads.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leads[0];

    // Check access permissions
    if (req.user.role !== 'admin' && lead.assigned_agent_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Convert tag data to tags array format
    if (lead.tag_ids) {
      const tagIds = lead.tag_ids.split(',');
      const tagNames = lead.tag_names.split(',');
      const tagColors = lead.tag_colors.split(',');
      
      lead.tags = tagIds.map((id, index) => ({
        id: id.trim(),
        name: tagNames[index]?.trim() || '',
        color: tagColors[index]?.trim() || '#3b82f6'
      }));
    } else {
      lead.tags = [];
    }

    // Clean up the response
    delete lead.tag_ids;
    delete lead.tag_names;
    delete lead.tag_colors;

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create new lead
router.post('/', [
  auth,
  body('mobile_number').isMobilePhone().withMessage('Invalid mobile number'),
  body('school_name').trim().isLength({ min: 2 }).withMessage('School name must be at least 2 characters'),
  body('school_address').optional().trim()
], async (req, res) => {
  try {
    console.log('[CREATE LEAD] Request body:', req.body);
    console.log('[CREATE LEAD] User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[CREATE LEAD] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile_number, school_name, school_address, notes, assigned_agent_id, tagIds } = req.body;

    // Check if mobile number already exists
    const [existing] = await db.execute(
      'SELECT id FROM leads WHERE mobile_number = ?',
      [mobile_number]
    );

    if (existing.length > 0) {
      console.log('[CREATE LEAD] Mobile number already exists:', mobile_number);
      return res.status(400).json({ error: 'Mobile number already exists' });
    }

    // Create lead
    console.log('[CREATE LEAD] Creating lead with data:', {
      mobile_number, school_name, school_address, notes, 
      assigned_agent_id, created_by: req.user.userId
    });
    
    const [result] = await db.execute(`
      INSERT INTO leads (
        mobile_number, school_name, school_address, notes, 
        assigned_agent_id, created_by, client_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      mobile_number, 
      school_name, 
      school_address || null, 
      notes || null, 
      assigned_agent_id || null, 
      req.user.userId,
      req.body.client_name || null
    ]);

    const leadId = result.insertId;
    console.log('[CREATE LEAD] Lead created with ID:', leadId);

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await db.execute(
          'INSERT INTO lead_tags (lead_id, tag_id) VALUES (?, ?)',
          [leadId, tagId]
        );
      }
      console.log('[CREATE LEAD] Tags added:', tagIds);
    }

    res.status(201).json({ id: leadId, message: 'Lead created successfully' });
  } catch (error) {
    console.error('[CREATE LEAD] Error:', error);
    res.status(500).json({ error: 'Failed to create lead: ' + error.message });
  }
});

// Update lead
router.put('/:id', [
  auth,
  body('schoolName').optional().trim().isLength({ min: 2 }),
  body('status').optional().isIn(['new', 'interested', 'follow_up', 'not_interested', 'closed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if lead exists and user has permission
    const [leads] = await db.execute('SELECT * FROM leads WHERE id = ?', [id]);
    if (leads.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leads[0];
    if (req.user.role !== 'admin' && lead.assigned_agent_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (key !== 'tagIds' && updates[key] !== undefined) {
        let value = updates[key];
        // Convert date strings to proper format
        if (key === 'next_followup_date' && value) {
          value = new Date(value).toISOString().split('T')[0]; // Convert to YYYY-MM-DD
        }
        // Handle client_name field
        if (key === 'client_name') {
          updateFields.push('client_name = ?');
          updateValues.push(value);
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(id);
      await db.execute(
        `UPDATE leads SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Update tags if provided
    if (updates.tagIds !== undefined) {
      // Remove existing tags
      await db.execute('DELETE FROM lead_tags WHERE lead_id = ?', [id]);
      
      // Add new tags
      if (updates.tagIds.length > 0) {
        for (const tagId of updates.tagIds) {
          await db.execute(
            'INSERT INTO lead_tags (lead_id, tag_id) VALUES (?, ?)',
            [id, tagId]
          );
        }
      }
    }

    res.json({ message: 'Lead updated successfully' });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM leads WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

module.exports = router;