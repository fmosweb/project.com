// Simple script to display the SQL commands needed to fix the schema cache issue

const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'fix_categories_schema_cache.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('\nCopy and paste the following SQL commands into the Supabase SQL Editor:\n');
console.log(sqlContent);
console.log('\nAfter executing these commands, restart your Next.js development server.');