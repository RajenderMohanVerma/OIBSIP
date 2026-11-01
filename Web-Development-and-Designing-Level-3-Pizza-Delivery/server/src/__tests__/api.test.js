const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Pizza = require('../models/Pizza');

const MONGO_URI = process.env.MONGODB_URI;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

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
  });

  test('POST /api/auth/register — rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/register — rejects weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'weak@example.com', password: 'weak' });
    expect(res.status).toBe(422);
  });

  test('POST /api/auth/login — returns token on valid credentials', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login — rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass123' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — requires auth', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — returns user when authenticated', async () => {
    const regRes = await request(app).post('/api/auth/register').send(validUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });
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
    // Create and log in as admin
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
  });

  test('POST /api/pizzas — admin can create pizza', async () => {
    const res = await request(app)
      .post('/api/pizzas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(pizza);
    expect(res.status).toBe(201);
    expect(res.body.data.pizza.name).toBe(pizza.name);
  });

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
  });

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
  });
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
  });
});

