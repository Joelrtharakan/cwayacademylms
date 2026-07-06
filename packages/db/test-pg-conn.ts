import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: "postgresql://cwayuser:W5lNF1swSRij3BUM9pPgAKFuREUQRLSG@dpg-d8p66aok1i2s73eu1igg-a.singapore-postgres.render.com/cway?sslmode=require",
    connectionTimeoutMillis: 10000 // 10 seconds timeout
  });

  try {
    console.log("Connecting via pg...");
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("Time from DB:", res.rows[0].now);
  } catch (err: any) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}
main();
