// tests/app.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

// Mock pour mongoose
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  const mockFind = jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([
      { _id: '1', title: 'Test task', completed: false }
    ])
  });
  return {
    ...originalModule,
    connect: jest.fn().mockResolvedValue(true),
    Schema: originalModule.Schema,
    model: jest.fn().mockReturnValue({
      find: mockFind,
      findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: '1', title: 'Updated task' }),
      findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '1' }),
      save: jest.fn().mockImplementation(function() {
        return Promise.resolve(this);
      })
    })
  };
});

describe('API Routes', () => {
  describe('GET /api', () => {
    it('should return welcome message', async () => {
      const res = await request(app).get('/api');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});