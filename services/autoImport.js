const mysql = require('mysql2/promise');
const db = require('../config/database');

const remoteDbConfig = {
  host: '94.136.184.114',
  user: 'proschool360',
  password: 'proschool360',
  database: 'proschool360',
  port: 3306
};

let autoImportInterval = null;
let isAutoImportEnabled = false;

async function importNewLeads() {
  let remoteConnection;
  
  try {
    console.log('[AUTO-IMPORT] Starting auto import...');
    
    remoteConnection = await mysql.createConnection(remoteDbConfig);
    
    // Fetch ALL WhatsApp conversations (remove timestamp filter for full sync)
    const [conversations] = await remoteConnection.execute(`
      SELECT 
        phone_number,
        contact_name,
        status,
        created_at,
        last_message_at
      FROM whatsapp_conversations 
      WHERE branch_id = 0 
      ORDER BY created_at DESC
    `);

    let importedCount = 0;
    let updatedCount = 0;

    for (const conv of conversations) {
      try {
        // Check if lead already exists
        const [existing] = await db.execute(
          'SELECT id FROM leads WHERE mobile_number = ?',
          [conv.phone_number]
        );

        // Map status
        let leadStatus = 'new';
        if (conv.status === 'resolved' || conv.status === 'closed') {
          leadStatus = 'closed';
        } else if (conv.status === 'pending') {
          leadStatus = 'follow_up';
        }

        if (existing.length > 0) {
          // Update existing lead
          await db.execute(`
            UPDATE leads SET 
              school_name = ?,
              status = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE mobile_number = ?
          `, [
            conv.contact_name || `WhatsApp Contact ${conv.phone_number}`,
            leadStatus,
            conv.phone_number
          ]);
          updatedCount++;
        } else {
          // Create new lead with original WhatsApp created_at time
          await db.execute(`
            INSERT INTO leads (
              mobile_number, 
              school_name, 
              status, 
              next_followup_date,
              created_at
            ) VALUES (?, ?, ?, CURDATE(), ?)
          `, [
            conv.phone_number,
            conv.contact_name || `WhatsApp Contact ${conv.phone_number}`,
            leadStatus,
            conv.created_at
          ]);
          importedCount++;
        }
      } catch (error) {
        console.error('[AUTO-IMPORT] Error importing conversation:', error);
      }
    }

    console.log(`[AUTO-IMPORT] Completed. Imported ${importedCount} new, updated ${updatedCount} existing`);
    return { imported: importedCount, updated: updatedCount, total: conversations.length };

  } catch (error) {
    console.error('[AUTO-IMPORT] Error:', error);
    throw error;
  } finally {
    if (remoteConnection) {
      await remoteConnection.end();
    }
  }
}

function startAutoImport(intervalMinutes = 5) {
  if (autoImportInterval) {
    clearInterval(autoImportInterval);
  }
  
  isAutoImportEnabled = true;
  console.log(`[AUTO-IMPORT] Started with ${intervalMinutes} minute interval`);
  
  // Run immediately
  importNewLeads().catch(console.error);
  
  // Set interval
  autoImportInterval = setInterval(() => {
    importNewLeads().catch(console.error);
  }, intervalMinutes * 60 * 1000);
}

function stopAutoImport() {
  if (autoImportInterval) {
    clearInterval(autoImportInterval);
    autoImportInterval = null;
  }
  isAutoImportEnabled = false;
  console.log('[AUTO-IMPORT] Stopped');
}

function getAutoImportStatus() {
  return {
    enabled: isAutoImportEnabled,
    intervalMinutes: autoImportInterval ? 5 : 0
  };
}

module.exports = {
  startAutoImport,
  stopAutoImport,
  getAutoImportStatus,
  importNewLeads
};