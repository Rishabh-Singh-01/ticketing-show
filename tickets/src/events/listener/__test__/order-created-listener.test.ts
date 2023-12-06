import { OrderCreatedEvent, OrderStatus } from '@rs-ticketing/common';
import { OrderCreatedListener } from '../order-created-listener';
import { Ticket } from '../../../models/ticket';
import { generateId } from '../../../test/id-generator';
import { natsWrapper } from '../../../utils/nats-wrapper';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    userId: generateId(),
    title: 'Big Concert',
    price: 1999,
  });
  await ticket.save();

  // creating a fake data event replicating the ticket update event
  const data: OrderCreatedEvent['data'] = {
    id: generateId(),
    version: 0,
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    userId: generateId(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // creating a fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('sets the userId to the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes an event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  const updatedTicket = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(updatedTicket.orderId).toEqual(data.id);
});
