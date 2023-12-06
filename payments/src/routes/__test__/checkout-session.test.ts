import { OrderStatus } from '@rs-ticketing/common';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { getSignUpCookie } from '../../test/singupHelper';
import { generateId } from '../../test/id-generator';

const endpointUrl = '/api/v1/payments/checkout';

it('returns a 404 when purchasing an order that does not exis', async () => {
  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({
      token: 'asldkfj',
      orderId: generateId(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: generateId(),
    userId: generateId(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie())
    .send({
      token: 'asldkfj',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = generateId();
  const order = Order.build({
    id: generateId(),
    userId,
    version: 1,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie(userId))
    .send({
      orderId: order.id,
      token: 'asdlkfj',
    })
    .expect(400);
});

// WILL WORK ONLY WHEN STRIPE SECRET KEY IS PROVIDED FOR LOCAL TESTING
it('returns 201 and creates the chekout session for the valid request', async () => {
  const price = 1;
  const userId = generateId();
  const order = Order.build({
    id: generateId(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();
  const { body: checkoutData } = await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie(userId))
    .send({
      orderId: order.id,
    })
    .expect(201);

  expect(checkoutData).toBeDefined();
  expect(checkoutData.url).toBeDefined();
  expect(checkoutData.url).not.toBeNull();
  expect(checkoutData.length).not.toEqual(0);
});
