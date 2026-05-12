import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';

const router = Router();

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
}

router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const user = db
    .prepare('SELECT id, email, password_hash, name FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
    expiresIn: '24h',
  });

  res.json({
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    },
  });
});

router.post('/logout', (_req, res) => {
  res.json({ data: { success: true } });
});

export default router;
