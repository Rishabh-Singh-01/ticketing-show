import { OrderStatus } from '@rs-ticketing/common';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { getSignUpCookie } from '../../test/singupHelper';
import { generateId } from '../../test/id-generator';
import { stripe } from '../../utils/stripe';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../utils/nats-wrapper';

const endpointUrl = '/api/v1/payments';

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
it('returns 201 and complete the charge for the valid request', async () => {
  const price = Math.floor(Math.random() * 100000);
  const userId = generateId();
  const order = Order.build({
    id: generateId(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();
  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie(userId))
    .send({
      orderId: order.id,
      token: 'tok_visa',
    })
    .expect(201);

  const stripeCharges = await stripe.paymentIntents.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('inr');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});

it('publishes event for the valid request', async () => {
  const price = 2000;
  const userId = generateId();
  const order = Order.build({
    id: generateId(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();
  await request(app)
    .post(endpointUrl)
    .set('Cookie', getSignUpCookie(userId))
    .send({
      orderId: order.id,
      token: 'tok_visa',
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
