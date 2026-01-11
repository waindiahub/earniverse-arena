const express = require('express');
const mysql = require('mysql2/promise');
const { auth } = require('../auth');
const db = require('../database');

const router = express.Router();

// Remote database configuration
const remoteDbConfig = {
  host: '94.136.184.114',
  user: 'proschool360',
  password: 'proschool360',
  database: 'proschool360',
  port: 3306
};

// Import WhatsApp conversations as leads
router.post('/import', auth, async (req, res) => {
  let remoteConnection;
  
  try {
    // Connect to remote database
    remoteConnection = await mysql.createConnection(remoteDbConfig);
    
    // Fetch WhatsApp conversations with synced contact names from remote database
    const [conversations] = await remoteConnection.execute(`
      SELECT 
        wc.phone_number,
        wc.contact_name,
        wc.status,
        wc.created_at,
        wc.last_message_at,
        wsc.full_name as synced_contact_name
      FROM whatsapp_conversations wc
      LEFT JOIN whatsapp_synced_contacts wsc ON wc.phone_number = wsc.phone_number AND wsc.branch_id = 0
      WHERE wc.branch_id = 0 
      ORDER BY wc.created_at DESC
    `);

    let importedCount = 0;
    let skippedCount = 0;

    for (const conv of conversations) {
      try {
        // Check if lead already exists
        const [existing] = await db.execute(
          'SELECT id FROM leads WHERE mobile_number = ?',
          [conv.phone_number]
        );

        // Map WhatsApp status to lead status
        let leadStatus = 'new';
        if (conv.status === 'resolved' || conv.status === 'closed') {
          leadStatus = 'closed';
        } else if (conv.status === 'pending') {
          leadStatus = 'follow_up';
        }

        if (existing.length > 0) {
          // Update existing lead
          const clientName = conv.synced_contact_name || conv.contact_name || null;
          await db.execute(`
            UPDATE leads SET 
              school_name = ?,
              client_name = ?,
              status = ?,
              notes = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE mobile_number = ?
          `, [
            conv.contact_name || `WhatsApp Contact ${conv.phone_number}`,
            clientName,
            leadStatus,
            `Updated from WhatsApp. Last message: ${conv.last_message_at || 'N/A'}`,
            conv.phone_number
          ]);
          skippedCount++;
        } else {
          // Create lead from WhatsApp conversation with original created_at time
          const clientName = conv.synced_contact_name || conv.contact_name || null;
          await db.execute(`
            INSERT INTO leads (
              mobile_number, 
              school_name, 
              client_name,
              status, 
              next_followup_date,
              created_by,
              created_at
            ) VALUES (?, ?, ?, ?, CURDATE(), ?, ?)
          `, [
            conv.phone_number,
            conv.contact_name || `WhatsApp Contact ${conv.phone_number}`,
            clientName,
            leadStatus,
            req.user.userId,
            conv.created_at
          ]);
          importedCount++;
        }
      } catch (error) {
        console.error('Error importing conversation:', error);
        skippedCount++;
      }
    }

    res.json({
      message: 'Import completed',
      imported: importedCount,
      updated: skippedCount,
      total: conversations.length
    });

  } catch (error) {
    console.error('WhatsApp import error:', error);
    res.status(500).json({ error: 'Failed to import WhatsApp leads: ' + error.message });
  } finally {
    if (remoteConnection) {
      await remoteConnection.end();
    }
  }
});

// Get import status/stats
router.get('/stats', auth, async (req, res) => {
  let remoteConnection;
  
  try {
    remoteConnection = await mysql.createConnection(remoteDbConfig);
    
    const [stats] = await remoteConnection.execute(`
      SELECT 
        COUNT(*) as total_conversations,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_conversations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_conversations,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_conversations
      FROM whatsapp_conversations 
      WHERE branch_id = 0
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('WhatsApp stats error:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp stats: ' + error.message });
  } finally {
    if (remoteConnection) {
      await remoteConnection.end();
    }
  }
});

// Auto-import controls
router.post('/auto-import/start', auth, async (req, res) => {
  try {
    const { intervalMinutes = 5 } = req.body;
    const autoImport = require('../services/autoImport');
    autoImport.startAutoImport(intervalMinutes);
    res.json({ message: 'Auto-import started', intervalMinutes });
  } catch (error) {
    console.error('Auto-import start error:', error);
    res.status(500).json({ error: 'Failed to start auto-import: ' + error.message });
  }
});

router.post('/auto-import/stop', auth, async (req, res) => {
  try {
    const autoImport = require('../services/autoImport');
    autoImport.stopAutoImport();
    res.json({ message: 'Auto-import stopped' });
  } catch (error) {
    console.error('Auto-import stop error:', error);
    res.status(500).json({ error: 'Failed to stop auto-import: ' + error.message });
  }
});

router.get('/auto-import/status', auth, async (req, res) => {
  try {
    const autoImport = require('../services/autoImport');
    const status = autoImport.getAutoImportStatus();
    res.json(status);
  } catch (error) {
    console.error('Auto-import status error:', error);
    res.status(500).json({ error: 'Failed to get auto-import status: ' + error.message });
  }
});

module.exports = router;