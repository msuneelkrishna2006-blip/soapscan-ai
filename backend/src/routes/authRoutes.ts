import { Router, Request, Response } from 'express';
import {
  findUserByEmail,
  findUserById,
  createUser,
} from '../services/dbService';
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  AuthenticatedRequest,
} from '../services/authService';
import { User, UserProfile } from '../types';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  const { name, email, password, householdName } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    householdName?: string;
  };

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = hashPassword(password);
  const resolvedHousehold = householdName && householdName.trim().length > 0
    ? householdName.trim()
    : `${name.trim()}'s Household`;

  const newUser: User = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    householdName: resolvedHousehold,
    createdAt: new Date().toISOString(),
  };

  createUser(newUser);

  const profile: UserProfile = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    householdName: newUser.householdName,
    createdAt: newUser.createdAt,
  };

  const token = signToken(profile);
  return res.status(201).json({ token, user: profile });
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password. Please verify your credentials.' });
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password. Please verify your credentials.' });
  }

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    householdName: user.householdName,
    createdAt: user.createdAt,
  };

  const token = signToken(profile);
  return res.json({ token, user: profile });
});

// POST /api/auth/demo-login (Instant 1-click Commander Login into Suneel's Smart Household)
authRouter.post('/demo-login', (_req: Request, res: Response) => {
  const demoEmail = 'suneel@soapscan.io';
  let user = findUserByEmail(demoEmail);

  if (!user) {
    const newUser: User = {
      id: `usr-suneel-${Date.now().toString(36)}`,
      name: 'Suneel Hegde',
      email: demoEmail,
      passwordHash: hashPassword('commander123'),
      householdName: "Suneel's Smart Household",
      createdAt: new Date().toISOString(),
    };
    createUser(newUser);
    user = newUser;
  }

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    householdName: user.householdName,
    createdAt: user.createdAt,
  };

  const token = signToken(profile);
  return res.json({ token, user: profile });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = findUserById(req.userId!);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    householdName: user.householdName,
    createdAt: user.createdAt,
  };

  return res.json({ user: profile });
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});
