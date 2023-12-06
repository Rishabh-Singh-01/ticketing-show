import request from 'supertest';
import { app } from '../../app';
import { getSignUpCookie } from '../../test/singupHelper';
import { generateId } from '../../test/id-generator';
import { Ticket } from '../../models/tickets';

const endpointUrl = '/api/v1/orders';

it('can not accessed if the user is not signed in', async () => {
  const id = generateId();
  return request(app).get(`${endpointUrl}/${id}`).send({}).expect(401);
});

it('can only be accessed if the user is signed in', async () => {
  const id = generateId();
  const res = await request(app)
    .get(`${endpointUrl}/${id}`)
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

it('returns a 404 error if the order is not found', async () => {
  const id = generateId();
  await request(app)
    .get(`${endpointUrl}/${id}`)
    .set('Cookie', getSignUpCookie())
    .send()
    .expect(404);
});

it('returns 401 error if the order is not of the current user', async () => {
  const ticket = await createTicket();

  const userOne = getSignUpCookie();
  const userTwo = getSignUpCookie();

  const { body: order } = await request(app)
    .post(endpointUrl)
    .set('Cookie', userOne)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`${endpointUrl}/${order.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});

it('returns the order for the valid request', async () => {
  const ticket = await createTicket();

  const user = getSignUpCookie();

  const { body: order } = await request(app)
    .post(endpointUrl)
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`${endpointUrl}/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
  expect(fetchedOrder.ticket.id).toEqual(ticket.id);
});
