import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import express from 'express';
import app from '../../src/app.js';
import { errorHandler } from '../../src/middlewares/task.js';

function request(app, { method = 'GET', path, body, rawBody, headers = {} }) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      let payload = rawBody;

      if (payload === undefined && body !== undefined) {
        payload = JSON.stringify(body);
      }

      const requestHeaders = { ...headers };

      if (payload !== undefined) {
        requestHeaders['content-type'] = 'application/json';
        requestHeaders['content-length'] = Buffer.byteLength(payload);
      }

      const requestOptions = {
        port: server.address().port,
        path,
        method,
        headers: requestHeaders,
      };

      const req = http.request(requestOptions, (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          text += chunk;
        });
        res.on('end', () => {
          server.close();

          let responseBody;

          if (text) {
            responseBody = JSON.parse(text);
          }

          resolve({ status: res.statusCode, body: responseBody });
        });
      });

      req.on('error', (error) => {
        server.close();
        reject(error);
      });

      if (payload !== undefined) {
        req.write(payload);
      }

      req.end();
    });
  });
}

test('validates task input and rejects unknown fields', async () => {
  const response = await request(app, { method: 'POST', path: '/tasks', body: { title: '  ', extra: true } });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'BAD_REQUEST');
});

test('validates positive integer IDs without partial numeric values', async () => {
  const response = await request(app, { path: '/tasks/12abc' });
  assert.equal(response.status, 400);
});

test('rejects IDs above the MySQL INT UNSIGNED limit', async () => {
  const response = await request(app, { path: '/tasks/4294967296' });
  assert.equal(response.status, 400);
});

test('returns 400 for malformed JSON', async () => {
  const response = await request(app, { method: 'POST', path: '/tasks', rawBody: '{"title":' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.message, 'Malformed JSON');
});

test('returns 404 for an unknown route and 200 for health', async () => {
  assert.equal((await request(app, { path: '/missing' })).status, 404);
  assert.deepEqual((await request(app, { path: '/health' })).body, { status: 'ok' });
});

test('propagates rejected async handlers to the error middleware', async () => {
  const failingApp = express();
  failingApp.get('/failure', async () => {
    throw new Error('database failure');
  });
  failingApp.use(errorHandler);
  const response = await request(failingApp, { path: '/failure' });
  assert.equal(response.status, 500);
  assert.deepEqual(response.body, { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});
