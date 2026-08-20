import assert from 'node:assert';
import test from 'node:test';

// Use port 3001 for tests to avoid port conflicts with the running dev server
process.env.PORT = '3001';
const { server } = await import('./server.js');

const BASE_URL = 'http://localhost:3001';

test('Task Manager REST API with Auth Verification', async (t) => {
  let jwtToken = '';

  // Test 1: Verify that accessing /tasks without authentication returns 401
  await t.test('GET /tasks - rejects unauthenticated request with 401', async () => {
    const res = await fetch(`${BASE_URL}/tasks`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.ok(data.error);
  });

  // Test 2: Register a new user
  await t.test('POST /register - successfully registers a user', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'securepassword123'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.message, 'User registered successfully.');
    assert.strictEqual(data.user.username, 'testuser');
    assert.ok(data.user.id);
  });

  // Test 3: Login verification
  await t.test('POST /login - rejects invalid credentials', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'wrongpassword'
      })
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.error, 'Invalid credentials.');
  });

  await t.test('POST /login - successfully returns JWT on valid credentials', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'securepassword123'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    jwtToken = data.token; // Save token for subsequent tests
  });

  // Test 4: Authenticated GET /tasks
  await t.test('GET /tasks - returns seeded tasks with valid token', async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.deepStrictEqual(data, [
      { id: 1, title: 'Learn Node.js', done: false },
      { id: 2, title: 'Build a REST API', done: false }
    ]);
  });

  // Test 5: Authenticated POST /tasks
  let createdTask;
  await t.test('POST /tasks - creates a task with valid token', async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ title: 'Finish lab' })
    });
    assert.strictEqual(res.status, 201);
    createdTask = await res.json();
    assert.strictEqual(createdTask.title, 'Finish lab');
    assert.strictEqual(createdTask.done, false);
    assert.ok(createdTask.id);
  });

  // Test 6: Authenticated PUT /tasks/:id
  await t.test('PUT /tasks/:id - updates task with valid token', async () => {
    const res = await fetch(`${BASE_URL}/tasks/${createdTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ title: 'Finish lab task', done: true })
    });
    assert.strictEqual(res.status, 200);
    const updatedTask = await res.json();
    assert.strictEqual(updatedTask.id, createdTask.id);
    assert.strictEqual(updatedTask.title, 'Finish lab task');
    assert.strictEqual(updatedTask.done, true);
  });

  // Test 7: Authenticated DELETE /tasks/:id
  await t.test('DELETE /tasks/:id - deletes task with valid token', async () => {
    const res = await fetch(`${BASE_URL}/tasks/${createdTask.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    assert.strictEqual(res.status, 200);
    const result = await res.json();
    assert.deepStrictEqual(result, { message: 'Task deleted successfully.' });

    // Verify tasks are back to seeded items
    const resList = await fetch(`${BASE_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    const dataList = await resList.json();
    assert.deepStrictEqual(dataList, [
      { id: 1, title: 'Learn Node.js', done: false },
      { id: 2, title: 'Build a REST API', done: false }
    ]);
  });
});

// Close server after all tests run
test.after(() => {
  server.close();
});
