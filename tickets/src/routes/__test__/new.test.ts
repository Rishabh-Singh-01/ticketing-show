import request from 'supertest';
import { app } from '../../app';
import { getSignUpCookie } from '../../test/singupHelper';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../utils/nats-wrapper';

it('has a route handler listening to /api/v1/tickets for post requests', async () => {
  const res = await request(app).post('/api/v1/tickets').send({});
  expect(res.status).not.toEqual(404);
});

it('can not accessed if the user is not signed in', async () => {
  return request(app).post('/api/v1/tickets').send({}).expect(401);
});
it('can only be accessed if the user is signed in', async () => {
  const res = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({});
  expect(res.status).not.toEqual(401);
});
it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title: '',
      price: 1000,
    })
    .expect(400);

  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      price: 1000,
    })
    .expect(400);
});
it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title: 'Some ticket title',
      price: -1000,
    })
    .expect(400);

  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title: 'Some ticket title',
    })
    .expect(400);
  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title: 'Some ticket title',
      price: 0,
    })
    .expect(400);
});
it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = 'Some Ticket';
  const price = 2000;
  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title,
      price,
    })
    .expect(201);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

it('publishes an event', async () => {
  const title = 'Some Ticket';
  const price = 2000;
  await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title,
      price,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
