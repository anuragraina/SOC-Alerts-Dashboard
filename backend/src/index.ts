import 'dotenv/config';
import express from 'express';
import authRouter from './routes/auth';
import alertsRouter from './routes/alerts';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});

app.use('/api/auth', authRouter);
app.use('/api/alerts', alertsRouter);

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
