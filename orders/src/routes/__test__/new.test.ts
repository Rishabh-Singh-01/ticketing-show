import request from 'supertest';
import { app } from '../../app';
import { getSignUpCookie } from '../../test/singupHelper';
import mongoose from 'mongoose';
import { generateId } from '../../test/id-generator';
import { Ticket } from '../../models/tickets';
import { Order, OrderStatus } from '../../models/orders';
import { natsWrapper } from '../../utils/nats-wrapper';

const endpointUrl = '/api/v1/orders';

it(`has a route handler listening to ${endpointUrl} for post requests`, async () => {
  const res = await request(app).post(endpointUrl).send({});
  expect(res.status).not.toEqual(404);
});

it('can not accessed if the user is not signed in', async () => {
  return request(app).post(endpointUrl).send({}).expect(401);
});
it('can only be accessed if the user is signed in', async () => {
  const res = await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({});
  expect(res.status).not.toEqual(401);
});
it('returns an error if an invalid ticketId is provided', async () => {
  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({})
    .expect(400);

  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({
      ticketId: '',
    })
    .expect(400);
});

it('does not returns an error if an valid ticketId is provided', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const res2 = await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({
      ticketId: id,
    });
  expect(res2.status).not.toEqual(400);
});

// BUSINESS LOGIC TEST

it('returns 404 error if non saved ticket is used', async () => {
  const id = generateId();

  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({
      ticketId: id,
    })
    .expect(404);
});

it('returns 400 if ticket is already reserved', async () => {
  const id = generateId();
  const userId = generateId();
  const title = 'Some Concert';
  const price = 2000;
  const ticket = Ticket.build({
    id,
    title,
    price,
  });
  await ticket.save();

  const order = Order.build({
    userId,
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);

  const totalOrders = await Order.find({});
  expect(totalOrders.length).toEqual(1);
});

it('reserves an order for valid request', async () => {
  const id = generateId();
  const title = 'Some Concert';
  const price = 2000;
  const ticket = Ticket.build({
    id,
    title,
    price,
  });
  await ticket.save();
  const res = await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const orderCreated = await Order.findById(res.body.id);
  const orderCreatedFindByTicket = await Order.find({
    ticket,
  });
  expect(orderCreated).not.toBeNull();
  expect(orderCreatedFindByTicket.length).toEqual(1);
  expect(orderCreated).toEqual(orderCreatedFindByTicket[0]);
});
it('emits events for order created', async () => {
  const id = generateId();
  const title = 'Some Concert';
  const price = 2000;
  const ticket = Ticket.build({
    id,
    title,
    price,
  });
  await ticket.save();
  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
