import { describe, it, expect } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import User from '../Models/Usermodel.js';
import app from '../../server.js';

describe('Auth Endpoints (POST /api/auth/login)', () => {
  it('should fail login if the user does not exist', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'somesh.2428it520@kiet.edu',
        password: '1234'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should fail login if the password is incorrect', async () => {
    // Create a user first
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('correctpassword', salt);
    await User.create({
      name: 'Teacher Joe',
      email: 'joe@kiet.edu',
      password: hashedPassword,
      role: 'teacher'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'joe@kiet.edu',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should login successfully with correct credentials', async () => {
    // Create a user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('secret123', salt);
    await User.create({
      name: 'Student Jack',
      email: 'jack@kiet.edu',
      password: hashedPassword,
      role: 'student'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jack@kiet.edu',
        password: 'secret123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role', 'student');
    expect(res.body).toHaveProperty('email', 'jack@kiet.edu');

    // Verify cookies are set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const hasAccessToken = cookies.some(c => c.includes('accessToken='));
    const hasRefreshToken = cookies.some(c => c.includes('refreshToken='));
    expect(hasAccessToken).toBe(true);
    expect(hasRefreshToken).toBe(true);
  });

  it('should refresh access token using refresh token cookie', async () => {
    // Create a user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('secret123', salt);
    await User.create({
      name: 'Student Jack2',
      email: 'jack2@kiet.edu',
      password: hashedPassword,
      role: 'student'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jack2@kiet.edu',
        password: 'secret123'
      });

    const cookies = loginRes.headers['set-cookie'];
    const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));

    const refreshRes = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', [refreshTokenCookie]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.headers['set-cookie']).toBeDefined();
    const hasNewAccessToken = refreshRes.headers['set-cookie'].some(c => c.includes('accessToken='));
    expect(hasNewAccessToken).toBe(true);
  });

  it('should clear cookies on logout', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const clearedAccessToken = cookies.some(c => c.includes('accessToken=;'));
    const clearedRefreshToken = cookies.some(c => c.includes('refreshToken=;'));
    expect(clearedAccessToken).toBe(true);
    expect(clearedRefreshToken).toBe(true);
  });
});
