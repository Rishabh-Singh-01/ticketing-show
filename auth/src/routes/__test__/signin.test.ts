import request from 'supertest';
import { app } from '../../app';

it('returns 400 with invalid email or password', async () => {
  await request(app)
    .post('/api/v1/users/signin')
    .send({
      email: 'test',
      password: 'password',
    })
    .expect(400);

  return request(app)
    .post('/api/v1/users/signin')
    .send({
      email: 'test@test.com',
      password: '',
    })
    .expect(400);
});

it('returns 400 with missing email or password', async () => {
  await request(app)
    .post('/api/v1/users/signin')
    .send({
      password: 'password',
    })
    .expect(400);

  return request(app)
    .post('/api/v1/users/signin')
    .send({
      email: 'test@test.com',
    })
    .expect(400);
});

it('returns 400 with invalid email not signed up', async () => {
  return request(app)
    .post('/api/v1/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400);
});

it('returns 400 with incorrect password credentails', async () => {
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  return request(app)
    .post('/api/v1/users/signin')
    .send({
      email: 'test@test.com',
      password: 'passwordisincorrect',
    })
    .expect(400);
});

it('returns response with cookie with valid credentails', async () => {
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  const res = await request(app)
    .post('/api/v1/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();
});
