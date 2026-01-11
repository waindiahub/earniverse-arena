const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get call logs for a lead
router.get('/lead/:leadId', auth, async (req, res) => {
  try {
    const { leadId } = req.params;

    // Check if user has access to this lead
    const [leads] = await db.execute(
      'SELECT assigned_agent_id FROM leads WHERE id = ?',
      [leadId]
    );

    if (leads.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    if (req.user.role !== 'admin' && leads[0].assigned_agent_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [callLogs] = await db.execute(`
      SELECT 
        cl.*,
        p.full_name as agent_name
      FROM call_logs cl
      LEFT JOIN profiles p ON cl.agent_id = p.user_id
      WHERE cl.lead_id = ?
      ORDER BY cl.created_at DESC
    `, [leadId]);

    res.json(callLogs);
  } catch (error) {
    console.error('Get call logs error:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

// Create new call log
router.post('/', [
  auth,
  body('leadId').isUUID(),
  body('notes').optional().trim(),
  body('previousStatus').optional().isIn(['new', 'interested', 'follow_up', 'not_interested', 'closed']),
  body('newStatus').optional().isIn(['new', 'interested', 'follow_up', 'not_interested', 'closed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leadId, notes, previousStatus, newStatus } = req.body;

    // Verify lead exists and user has access
    const [leads] = await db.execute(
      'SELECT assigned_agent_id FROM leads WHERE id = ?',
      [leadId]
    );

    if (leads.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    if (req.user.role !== 'admin' && leads[0].assigned_agent_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create call log
    await db.execute(`
      INSERT INTO call_logs (lead_id, agent_id, notes, previous_status, new_status)
      VALUES (?, ?, ?, ?, ?)
    `, [leadId, req.user.userId, notes, previousStatus, newStatus]);

    // Update lead status if newStatus is provided
    if (newStatus) {
      await db.execute(
        'UPDATE leads SET status = ? WHERE id = ?',
        [newStatus, leadId]
      );
    }

    res.status(201).json({ message: 'Call log created successfully' });
  } catch (error) {
    console.error('Create call log error:', error);
    res.status(500).json({ error: 'Failed to create call log' });
  }
});

module.exports = router;