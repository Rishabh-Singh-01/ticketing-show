import request from 'supertest';
import { app } from '../app';

const signupHelper = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const res = await request(app)
    .post('/api/v1/users/signup')
    .send({
      email,
      password,
    })
    .expect(201);

  expect(res.get('Set-Cookie')).toBeDefined();

  return res;
};
/**
 * returns cookie after signup with valid test email and password
 */
const getSignUpCookie = async () => {
  return (await signupHelper()).get('Set-Cookie');
};

export { getSignUpCookie };
