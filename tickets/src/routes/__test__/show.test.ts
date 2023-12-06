import request from 'supertest';
import { app } from '../../app';
import { getSignUpCookie } from '../../test/singupHelper';
import mongoose from 'mongoose';

it('returns 404 error if ticket not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/v1/tickets/${id}`).send().expect(404);
});

it('returns valid ticket if ticket if found', async () => {
  const title = 'Some Concert';
  const price = 2000;
  const ticketCreatedRes = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title,
      price,
    })
    .expect(201);

  const res = await request(app)
    .get(`/api/v1/tickets/${ticketCreatedRes.body.id}`)
    .send()
    .expect(200);

  expect(res.body.title).toEqual(title);
  expect(res.body.price).toEqual(price);
});
