import 'dotenv/config';
import express from 'express';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
