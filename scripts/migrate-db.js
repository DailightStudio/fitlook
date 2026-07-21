#!/usr/bin/env node

// Automated database migration for fitlook
// Runs drizzle/0003_add_model_3d_url.sql

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  console.log('🗄️  Running database migration...');

  try {
    // Dynamic import of pg
    const { Client } = await import('pg');
    const client = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log('✅ Connected to database');

    // Check if column already exists
    const checkResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products'
      AND column_name = 'model_3d_url'
    `);

    if (checkResult.rows.length > 0) {
      console.log('ℹ️  Column model_3d_url already exists, skipping');
      await client.end();
      return;
    }

    // Read and execute migration SQL
    const migrationPath = path.join(__dirname, '..', 'drizzle', '0003_add_model_3d_url.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('⏳ Executing migration...');
    await client.query(sql);

    console.log('✅ Migration executed successfully');
    console.log('   Added column: model_3d_url (text)');

    await client.end();
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.warn('⚠️  pg package not installed');
      console.warn('   Install with: npm install pg');
      console.warn('   Or execute migration manually in Neon dashboard');
      process.exit(0);
    }

    console.error('❌ Migration failed:', error.message);

    if (error.message.includes('duplicate column')) {
      console.log('ℹ️  Column likely already exists');
      process.exit(0);
    }

    process.exit(1);
  }
}

runMigration();
