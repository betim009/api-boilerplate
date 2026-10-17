import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../../src/app.js';
import pool from '../../src/config/connection.js';

const enabled = process.env.RUN_INTEGRATION_TESTS === '1';

function request({ method = 'GET', path, body }) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const payload = body === undefined ? undefined : JSON.stringify(body);
      const req = http.request({ port: server.address().port, path, method, headers: payload ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) } : {} }, (res) => {
        let text = '';
        res.on('data', (chunk) => { text += chunk; });
        res.on('end', () => { server.close(); resolve({ status: res.statusCode, body: text ? JSON.parse(text) : undefined }); });
      });
      req.on('error', (error) => { server.close(); reject(error); });
      if (payload) req.write(payload);
      req.end();
    });
  });
}

test('CRUD works against an explicitly configured separate MySQL database', { skip: !enabled }, async () => {
  assert.ok(process.env.TEST_DB_NAME, 'Set TEST_DB_NAME to the separate test database');
  assert.equal(process.env.DB_NAME, process.env.TEST_DB_NAME, 'Run this test with DB_NAME set to TEST_DB_NAME');
  await pool.query('TRUNCATE TABLE tasks');
  try {
    const created = await request({ method: 'POST', path: '/tasks', body: { title: 'Integration task' } });
    assert.equal(created.status, 201);
    assert.equal(created.body.completed, false);
    assert.equal((await request({ path: '/tasks' })).status, 200);
    assert.equal((await request({ path: `/tasks/${created.body.id}` })).status, 200);
    const unchanged = await request({ method: 'PATCH', path: `/tasks/${created.body.id}`, body: { title: 'Integration task', completed: false } });
    assert.equal(unchanged.status, 200);
    const updated = await request({ method: 'PATCH', path: `/tasks/${created.body.id}`, body: { completed: true } });
    assert.equal(updated.body.completed, true);
    assert.equal((await request({ method: 'DELETE', path: `/tasks/${created.body.id}` })).status, 204);
    assert.equal((await request({ path: `/tasks/${created.body.id}` })).status, 404);
  } finally {
    await pool.query('TRUNCATE TABLE tasks');
    await pool.end();
  }
});
