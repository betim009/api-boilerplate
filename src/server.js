import app from './app.js';
import pool from './config/connection.js';

const port = Number(process.env.PORT || 3000);

try {
  await pool.query('SELECT 1');
  app.listen(port, () => console.log(`API listening on port ${port}`));
} catch (error) {
  console.error('Could not connect to MySQL:', error.message);
  await pool.end();
  process.exitCode = 1;
}
