import 'dotenv/config';
import path from 'path';
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

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
