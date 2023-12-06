import request from 'supertest';
import { app } from '../../app';
import { getSignUpCookie } from '../../test/singupHelper';
import mongoose from 'mongoose';
import { generateId } from '../../test/id-generator';
import { Ticket } from '../../models/tickets';
import { Order, OrderStatus } from '../../models/orders';

const endpointUrl = '/api/v1/orders';

it(`has a route handler listening to ${endpointUrl} for get requests`, async () => {
  const res = await request(app).get(endpointUrl).send({});
  expect(res.status).not.toEqual(404);
});

it('can not accessed if the user is not signed in', async () => {
  return request(app).get(endpointUrl).send({}).expect(401);
});

it('can only be accessed if the user is signed in', async () => {
  const res = await request(app)
    .get(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({});
  expect(res.status).not.toEqual(401);
});

// BUSINESS LOGIC TEST

const createTicket = async () => {
  const id = generateId();
  const title = 'Some Concert';
  const price = 2000;
  const ticket = Ticket.build({
    id,
    title,
    price,
  });
  await ticket.save();
  return ticket;
};

it('returns all the orders', async () => {
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  const userOne = getSignUpCookie();
  const userTwo = getSignUpCookie();

  await request(app)
    .post(endpointUrl)
    .set('Cookie', userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post(endpointUrl)
    .set('Cookie', userTwo)
    .send({
      ticketId: ticketTwo.id,
    })
    .expect(201);
  const { body: orderThree } = await request(app)
    .post(endpointUrl)
    .set('Cookie', userTwo)
    .send({
      ticketId: ticketThree.id,
    })
    .expect(201);

  const response = await request(app)
    .get(endpointUrl)
    .set('Cookie', userTwo)
    .send()
    .expect(200);

  expect(response.body.orders.length).toEqual(2);
  expect(response.body.orders[0].id).toEqual(orderTwo.id);
  expect(response.body.orders[1].id).toEqual(orderThree.id);
  expect(response.body.orders[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body.orders[1].ticket.id).toEqual(ticketThree.id);
});
