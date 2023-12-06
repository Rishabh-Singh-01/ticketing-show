import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successful signup', async () => {
  return request(app)
    .post('/api/v1/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});

it('returns 400 with invalid email or password', async () => {
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      email: 'test',
      password: 'password',
    })
    .expect(400);

  return request(app)
    .post('/api/v1/users/signup')
    .send({
      email: 'test@test.com',
      password: 'p',
    })
    .expect(400);
});

it('returns 400 with missing email or password', async () => {
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      password: 'password',
    })
    .expect(400);

  return request(app)
    .post('/api/v1/users/signup')
    .send({
      email: 'test@test.com',
    })
    .expect(400);
});

it('returns valid cookie for successful signup', async () => {
  const res = await request(app)
    .post('/api/v1/users/signup')
    .send({
      email: 'test@example.com',
      password: 'password',
    })
    .expect(201);
  expect(res.get('Set-Cookie')).toBeDefined();
});
