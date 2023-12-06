import request from 'supertest';
import { app } from '../../app';
import { getSignUpCookie } from '../../test/singupHelper';

const createTicket = () => {
  return request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title: 'Trial ticket',
      price: 2500,
    });
};
it('returns list of all tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();
  await createTicket();

  const res = await request(app).get('/api/v1/tickets').send().expect(200);
  expect(res.body.tickets.length).toEqual(4);
});
