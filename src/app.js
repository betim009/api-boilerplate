import express from 'express';
import taskRouter from './routes/task.js';
import { errorHandler, notFoundHandler } from './middlewares/task.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/tasks', taskRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
