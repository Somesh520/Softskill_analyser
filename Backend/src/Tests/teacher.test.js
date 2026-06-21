import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import User from '../Models/Usermodel.js';
import Class from '../Models/Classmodel.js';
import Activity from '../Models/Activitymodel.js';
import app from '../../server.js';

// Helper to generate a test token
const generateTestToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET);
};

describe('Teacher Endpoints', () => {
  it('should block non-teachers from creating a class', async () => {
    const student = await User.create({
      name: 'Student Jack',
      email: 'studentjack@kiet.edu',
      password: 'password123',
      role: 'student'
    });

    const token = generateTestToken(student._id, 'student');

    const res = await request(app)
      .post('/api/teacher/create-class')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'BTech CSE 3rd Year',
        program: 'B.Tech',
        branch: 'CSE',
        semester: '5',
        section: 'A',
        academicYear: '2025-26'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Access Denied');
  });

  it('should allow teacher to create a class and fetch classes', async () => {
    const teacher = await User.create({
      name: 'Teacher Joe',
      email: 'joe2@kiet.edu',
      password: 'password123',
      role: 'teacher'
    });

    const token = generateTestToken(teacher._id, 'teacher');

    // Create Class
    const resCreate = await request(app)
      .post('/api/teacher/create-class')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'BTech CSE 3rd Year',
        program: 'B.Tech',
        branch: 'CSE',
        semester: '5',
        section: 'A',
        academicYear: '2025-26'
      });

    expect(resCreate.status).toBe(201);
    expect(resCreate.body.message).toContain('Class created successfully');
    expect(resCreate.body.class).toHaveProperty('name', 'BTech CSE 3rd Year');

    // Fetch Classes
    const resFetch = await request(app)
      .get('/api/teacher/classes')
      .set('Authorization', `Bearer ${token}`);

    expect(resFetch.status).toBe(200);
    expect(resFetch.body.length).toBe(1);
    expect(resFetch.body[0]).toHaveProperty('name', 'BTech CSE 3rd Year');
  });

  it('should allow teacher to create an Interview activity appointing another teacher', async () => {
    const teacherA = await User.create({
      name: 'Teacher A',
      email: 'teachera@kiet.edu',
      password: 'password123',
      role: 'teacher'
    });

    const teacherB = await User.create({
      name: 'Teacher B',
      email: 'teacherb@kiet.edu',
      password: 'password123',
      role: 'teacher'
    });

    const testClass = await Class.create({
      name: 'Class A',
      program: 'B.Tech',
      branch: 'CSE',
      semester: '5',
      section: 'A',
      academicYear: '2025-26',
      teacherId: teacherA._id
    });

    const tokenA = generateTestToken(teacherA._id, 'teacher');
    const tokenB = generateTestToken(teacherB._id, 'teacher');

    // Create Activity
    const resActivity = await request(app)
      .post('/api/teacher/activities')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Mock Placement Interview',
        description: 'Semester 5 placement preparation interviews.',
        classIds: [testClass._id.toString()],
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        maxPoints: 50,
        type: 'Interview',
        appointedTeacherId: teacherB._id.toString(),
        rubrics: [
          { criteria: 'Communication Skills', weight: 20 },
          { criteria: 'Technical Knowledge', weight: 30 }
        ]
      });

    expect(resActivity.status).toBe(201);
    expect(resActivity.body).toHaveProperty('title', 'Mock Placement Interview');
    expect(resActivity.body.appointedTeacherId).toBe(teacherB._id.toString());

    // Verify Teacher A can see the activity in their list
    const resA = await request(app)
      .get('/api/teacher/activities')
      .set('Authorization', `Bearer ${tokenA}`);
    
    expect(resA.status).toBe(200);
    expect(resA.body.some(act => act.title === 'Mock Placement Interview')).toBe(true);

    // Verify Teacher B (appointed evaluator) can also see the activity in their list
    const resB = await request(app)
      .get('/api/teacher/activities')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.some(act => act.title === 'Mock Placement Interview')).toBe(true);

    // Verify Teacher B cannot delete the activity
    const resDeleteB = await request(app)
      .delete(`/api/teacher/activities/${resActivity.body._id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resDeleteB.status).toBe(400); // Bad request / Unauthorized deletion
    expect(resDeleteB.body.message).toContain('Activity not found or unauthorized');

    // Verify Teacher A (creator) can delete the activity
    const resDeleteA = await request(app)
      .delete(`/api/teacher/activities/${resActivity.body._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(resDeleteA.status).toBe(200);
    expect(resDeleteA.body.message).toContain('deleted successfully');
  });
});
