#!/usr/bin/env node

/**
 * Database Migration Verification Script
 * Verifies that persistence features migration was successful
 */

const { Client } = require('pg');
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}→ ${message}${colors.reset}`);
}

async function verifyDatabase() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    logInfo('Connected to database');

    // Check if new tables exist
    const tables = [
      'reference_images',
      'promo_code', 
      'redeemed_promo_code'
    ];

    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);

      if (result.rows[0].exists) {
        logSuccess(`Table '${table}' exists`);
      } else {
        logError(`Table '${table}' is missing`);
      }
    }

    // Check if new columns exist in existing tables
    const columns = [
      { table: 'output_asset', column: 'persist_until' },
      { table: 'output_asset', column: 'is_removed' },
      { table: 'user', column: 'subscription_tier' },
      { table: 'user', column: 'subscription_status' },
      { table: 'user', column: 'credits_remaining' },
      { table: 'user', column: 'credits_total' },
      { table: 'user', column: 'polar_customer_id' },
      { table: 'user', column: 'polar_subscription_id' },
      { table: 'user', column: 'admin_tier' }
    ];

    for (const { table, column } of columns) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = $2
        );
      `, [table, column]);

      if (result.rows[0].exists) {
        logSuccess(`Column '${column}' in table '${table}' exists`);
      } else {
        logError(`Column '${column}' in table '${table}' is missing`);
      }
    }

    // Check indexes
    const indexes = [
      'promo_code_code_idx',
      'redeemed_promo_user_idx',
      'reference_images_user_id_idx',
      'output_asset_persist_until_idx'
    ];

    logInfo('Checking indexes...');
    for (const index of indexes) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE indexname = $1
        );
      `, [index]);

      if (result.rows[0].exists) {
        logSuccess(`Index '${index}' exists`);
      } else {
        logWarning(`Index '${index}' may be missing`);
      }
    }

    // Check foreign key constraints
    const constraints = [
      'redeemed_promo_code_user_id_user_id_fk',
      'reference_images_user_id_user_id_fk',
      'reference_images_output_id_output_asset_id_fk'
    ];

    logInfo('Checking foreign key constraints...');
    for (const constraint of constraints) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints 
          WHERE constraint_name = $1
          AND constraint_type = 'FOREIGN KEY'
        );
      `, [constraint]);

      if (result.rows[0].exists) {
        logSuccess(`Foreign key '${constraint}' exists`);
      } else {
        logWarning(`Foreign key '${constraint}' may be missing`);
      }
    }

    logSuccess('Database verification completed');

  } catch (error) {
    logError(`Database verification failed: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run verification
if (require.main === module) {
  log(`${colors.bright}${colors.blue}Persistence Features Database Verification${colors.reset}`);
  log('');

  if (!process.env.POSTGRES_URL) {
    logError('POSTGRES_URL environment variable is not set');
    process.exit(1);
  }

  verifyDatabase()
    .then(() => {
      log('');
      logSuccess('🎉 All persistence features database verification completed!');
    })
    .catch(error => {
      logError(`Verification failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { verifyDatabase };