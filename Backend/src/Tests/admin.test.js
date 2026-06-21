import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import User from '../Models/Usermodel.js';
import app from '../../server.js';

// Helper to generate a test token
const generateTestToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET);
};

describe('Admin Endpoints (RBAC and CRUD)', () => {
  it('should block unauthenticated access to admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/teachers');

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Access Denied');
  });

  it('should block non-admin users (e.g., teachers) from admin routes', async () => {
    const teacher = await User.create({
      name: 'Teacher Jane',
      email: 'jane@kiet.edu',
      password: 'password123',
      role: 'teacher'
    });

    const token = generateTestToken(teacher._id, 'teacher');

    const res = await request(app)
      .get('/api/admin/teachers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access Denied');
  });

  it('should allow admin users to access admin routes', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kiet.edu',
      password: 'password123',
      role: 'admin'
    });

    const token = generateTestToken(admin._id, 'admin');

    const res = await request(app)
      .get('/api/admin/teachers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should allow admin to create a teacher successfully', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin2@kiet.edu',
      password: 'password123',
      role: 'admin'
    });

    const token = generateTestToken(admin._id, 'admin');

    const res = await request(app)
      .post('/api/admin/add-teacher')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Teacher',
        email: 'newteacher@kiet.edu',
        password: 'teacherpassword123',
        deptName: 'Computer Science'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('Teacher successfully assigned');
    expect(res.body.teacher).toHaveProperty('email', 'newteacher@kiet.edu');
  });
});
