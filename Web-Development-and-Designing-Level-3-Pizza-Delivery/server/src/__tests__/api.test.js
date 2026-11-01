require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // ignore
}

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Pizza = require('../models/Pizza');

// Use isolated test database so production/dev seeded data is NEVER wiped
let baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crust-and-craft-test';
const TEST_MONGO_URI = baseUri.includes('?') 
  ? baseUri.replace(/\/[^/?]+(\?)/, '/crust-and-craft-test$1')
  : baseUri.replace(/\/[^/]+$/, '/crust-and-craft-test');

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
  });
}, 20000);

afterAll(async () => {
  if (mongoose.connection && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.connection.close();
}, 20000);

beforeEach(async () => {
  await User.deleteMany({});
  await Pizza.deleteMany({});
});

describe('Auth API', () => {
  const validUser = {
    name: 'Test Customer',
    email: 'test@example.com',
    password: 'TestPass123',
  };

  test('POST /api/auth/register — creates a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined();
  }, 10000);

  test('POST /api/auth/register — rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
  }, 10000);

  test('POST /api/auth/register — rejects weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'weak@example.com', password: 'weak' });
    expect(res.status).toBe(422);
  }, 10000);

  test('POST /api/auth/login — returns token on valid credentials', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  }, 10000);

  test('POST /api/auth/login — rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass123' });
    expect(res.status).toBe(401);
  }, 10000);

  test('GET /api/auth/me — requires auth', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  }, 10000);

  test('GET /api/auth/me — returns user when authenticated', async () => {
    const regRes = await request(app).post('/api/auth/register').send(validUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  }, 10000);
});

describe('Pizza API', () => {
  let adminToken;

  const pizza = {
    name: 'Test Margherita',
    description: 'Classic tomato and mozzarella',
    category: 'Classic',
    basePrice: 199,
    isVeg: true,
  };

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'Admin1234',
      role: 'admin',
    });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin1234' });
    adminToken = loginRes.body.data.token;
  });

  test('GET /api/pizzas — returns empty list', async () => {
    const res = await request(app).get('/api/pizzas');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  }, 10000);

  test('POST /api/pizzas — admin can create pizza', async () => {
    const res = await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(pizza);
    expect(res.status).toBe(201);
    expect(res.body.data.pizza.name).toBe(pizza.name);
  }, 10000);

  test('POST /api/pizzas — non-admin is rejected', async () => {
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Cust', email: 'cust@test.com', password: 'CustPass1' });
    const custToken = custRes.body.data.token;

    const res = await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${custToken}`)
      .send(pizza);
    expect(res.status).toBe(403);
  }, 10000);

  test('PATCH /api/pizzas/:id — admin can update', async () => {
    const createRes = await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(pizza);
    const id = createRes.body.data.pizza._id;

    const res = await request(app)
      .patch(`/api/pizzas/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ basePrice: 249 });

    expect(res.status).toBe(200);
    expect(res.body.data.pizza.basePrice).toBe(249);
  }, 10000);
});

describe('Payment API', () => {
  test('POST /api/payments/create-order — returns 503 without Razorpay credentials', async () => {
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Cust', email: 'cust@pay.com', password: 'CustPass1' });
    const token = custRes.body.data.token;

    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({ orderId: new mongoose.Types.ObjectId() });

    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/Razorpay/i);
  }, 10000);
});
