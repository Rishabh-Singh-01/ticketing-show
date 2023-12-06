import request from 'supertest';
import { app } from '../../app';
import { getSignUpCookie } from '../../test/singupHelper';

it('returns current user details for signed in user', async () => {
  const cookie = await getSignUpCookie();

  const res = await request(app)
    .get('/api/v1/users/currentUser')
    .set('Cookie', cookie)
    .send()
    .expect(200);
  expect(res.body.currentUser.email).toEqual('test@test.com');
});

it('returns no current user details for non signed in uses', async () => {
  const res = await request(app)
    .get('/api/v1/users/currentUser')
    .send()
    .expect(200);
  expect(res.body.currentUser).toBeNull();
});
