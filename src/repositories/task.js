import pool from '../config/connection.js';

function mapTask(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    completed: Boolean(row.completed),
  };
}

export async function createTask({ title, completed }) {
  const [result] = await pool.execute(
    'INSERT INTO tasks (title, completed) VALUES (?, ?)',
    [title, completed],
  );
  return findTaskById(result.insertId);
}

export async function findAllTasks() {
  const [rows] = await pool.query(
    'SELECT id, title, completed, created_at, updated_at FROM tasks ORDER BY id ASC',
  );
  return rows.map(mapTask);
}

export async function findTaskById(id) {
  const [rows] = await pool.execute(
    'SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?',
    [id],
  );
  return mapTask(rows[0]);
}

export async function updateTask(id, changes) {
  const fields = [];
  const values = [];
  if (Object.hasOwn(changes, 'title')) {
    fields.push('title = ?');
    values.push(changes.title);
  }

  if (Object.hasOwn(changes, 'completed')) {
    fields.push('completed = ?');
    values.push(changes.completed);
  }
  values.push(id);
  await pool.execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
  return findTaskById(id);
}

export async function deleteTask(id) {
  const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
