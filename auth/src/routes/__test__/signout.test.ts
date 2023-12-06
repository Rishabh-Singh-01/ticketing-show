import request from 'supertest';
import { app } from '../../app';

it('returns a response with no cookie after a valid signout', async () => {
  await request(app)
    .post('/api/v1/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  const res = await request(app)
    .post('/api/v1/users/signout')
    .send({})
    .expect(200);

  // express-session way to destory a cookie or set it as null
  const cookieSessionExpired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  expect(res.get('Set-Cookie').at(0)).toContain(cookieSessionExpired);
});
