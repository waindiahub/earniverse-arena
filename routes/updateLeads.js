const express = require('express');
const { auth } = require('../auth');
const db = require('../database');

const router = express.Router();

// One-time update to set followup dates for WhatsApp leads
router.post('/update-followup-dates', auth, async (req, res) => {
  try {
    // Update all WhatsApp leads that don't have a followup date
    const [result] = await db.execute(`
      UPDATE leads 
      SET next_followup_date = CURDATE() 
      WHERE school_name LIKE '%WhatsApp Contact%'
      AND next_followup_date IS NULL
    `);

    res.json({
      message: 'Followup dates updated',
      updated: result.affectedRows
    });
  } catch (error) {
    console.error('Update followup dates error:', error);
    res.status(500).json({ error: 'Failed to update followup dates: ' + error.message });
  }
});

module.exports = router;