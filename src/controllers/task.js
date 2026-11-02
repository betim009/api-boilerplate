import * as taskService from '../services/task.js';

export async function createTask(req, res) {
  const { title, completed } = req.body;

  const task = await taskService.createTask({
    title,
    completed,
  });

  return res.status(201).json(task);
}

export async function getAllTasks(_req, res) {
  const tasks = await taskService.listTasks();

  return res.status(200).json(tasks);
}

export async function getTaskById(req, res) {
  const { id } = req.params;
  const task = await taskService.getTask(id);

  return res.status(200).json(task);
}

export async function updateTask(req, res) {
  const { id } = req.params;
  const { title, completed } = req.body;
  const changes = {};

  if (Object.hasOwn(req.body, 'title')) {
    changes.title = title;
  }

  if (Object.hasOwn(req.body, 'completed')) {
    changes.completed = completed;
  }

  const task = await taskService.updateTask(id, changes);

  return res.status(200).json(task);
}

export async function deleteTask(req, res) {
  const { id } = req.params;
  await taskService.deleteTask(id);

  return res.status(204).send();
}
