import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { getSignUpCookie } from '../../test/singupHelper';
import { natsWrapper } from '../../utils/nats-wrapper';
import { Subjects } from '@rs-ticketing/common';
import { Ticket } from '../../models/ticket';
import { generateId } from '../../test/id-generator';

it('returns 401 error when user is not signed in', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/v1/tickets/${id}`)
    .send({
      title: 'Trial ticket',
      price: 1000,
    })
    .expect(401);
});
it('returns 404 error when ticket is not valid', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/v1/tickets/${id}`)
    .set('Cookie', getSignUpCookie())
    .send({
      title: 'Trial ticket',
      price: 1000,
    })
    .expect(404);
});
it('returns 403 error when user does not own the ticket', async () => {
  const titlePrev = 'Trial Ticket';
  const pricePrev = 1000;
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', getSignUpCookie())
    .send({
      title: titlePrev,
      price: pricePrev,
    });

  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', getSignUpCookie())
    .send({
      title: 'Trial ticket Updated',
      price: 1500,
    })
    .expect(401);

  const ticketResponse = await request(app)
    .get(`/api/v1/tickets/${response.body.id}`)
    .send();
  expect(ticketResponse.body.title).toEqual(titlePrev);
  expect(ticketResponse.body.price).toEqual(pricePrev);
});
it('returns 400 error when user provide invalid title or price', async () => {
  const cookie = getSignUpCookie();
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Trial ticket',
      price: 1000,
    });
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 9999,
    })
    .expect(400);
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 9999,
    })
    .expect(400);
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Trail Ticket updated',
      price: -1000,
    })
    .expect(400);
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Trail Ticket updated',
      price: 0,
    })
    .expect(400);
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Trail Ticket updated',
    })
    .expect(400);
});
it('updates the ticket when user provide valid request', async () => {
  const cookie = getSignUpCookie();
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Trial ticket',
      price: 1000,
    });

  const titleNew = 'Trial Ticket updated';
  const priceNew = 9999;
  const ticketResponse = await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: titleNew,
      price: priceNew,
    })
    .expect(200);
  expect(ticketResponse.body.id).toEqual(response.body.id);
  expect(ticketResponse.body.title).toEqual(titleNew);
  expect(ticketResponse.body.price).toEqual(priceNew);
});

it('publishes an event', async () => {
  const cookie = getSignUpCookie();
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Trial ticket',
      price: 1000,
    });

  const titleNew = 'Trial Ticket updated';
  const priceNew = 9999;
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: titleNew,
      price: priceNew,
    })
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenLastCalledWith(
    Subjects.TicketUpdated,
    expect.anything(),
    expect.anything()
  );
});

it('cannot edit the reserved ticket ie ticket already associated with order', async () => {
  const cookie = getSignUpCookie();
  const response = await request(app)
    .post('/api/v1/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Trial ticket',
      price: 1000,
    });

  // associating the ticket with some order
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: generateId() });
  await ticket!.save();

  const titleNew = 'Trial Ticket updated';
  const priceNew = 9999;
  await request(app)
    .put(`/api/v1/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: titleNew,
      price: priceNew,
    })
    .expect(400);
});
