const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.cgbfzoyymylzwjoxgbzv:Vuhailam123%40@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"
});
async function run() {
  await client.connect();
  console.log('Connected to Supabase. Enabling uuid-ossp extension...');
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;');
  console.log('Extension enabled successfully!');
  await client.end();
}
run().catch(console.error);
