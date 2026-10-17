import * as taskService from '../services/task.js';

export async function createTask(req, res) {
  res.status(201).json(await taskService.createTask(req.body));
}

export async function listTasks(_req, res) {
  res.json(await taskService.listTasks());
}

export async function getTask(req, res) {
  res.json(await taskService.getTask(req.params.id));
}

export async function updateTask(req, res) {
  res.json(await taskService.updateTask(req.params.id, req.body));
}

export async function deleteTask(req, res) {
  await taskService.deleteTask(req.params.id);
  res.status(204).send();
}
