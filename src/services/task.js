import * as taskRepository from '../repositories/task.js';

function taskNotFound() {
  return Object.assign(new Error('Task not found'), { status: 404, code: 'TASK_NOT_FOUND' });
}

export async function createTask(input) {
  return taskRepository.createTask(input);
}

export async function listTasks() {
  return taskRepository.findAllTasks();
}

export async function getTask(id) {
  const task = await taskRepository.findTaskById(id);
  if (!task) throw taskNotFound();
  return task;
}

export async function updateTask(id, changes) {
  const current = await taskRepository.findTaskById(id);
  if (!current) throw taskNotFound();
  return taskRepository.updateTask(id, changes);
}

export async function deleteTask(id) {
  const removed = await taskRepository.deleteTask(id);
  if (!removed) throw taskNotFound();
}
