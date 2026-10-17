import app from './app.js';
import pool from './config/connection.js';

const portValue = process.env.PORT || '3000';
const port = Number(portValue);

try {
  await pool.query('SELECT 1');
  app.listen(port, () => {
    console.log(`API Online: http://localhost:${port}/health`);
  });
} catch (error) {
  console.error('Could not connect to MySQL:', error.message);
  await pool.end();
  process.exitCode = 1;
}
