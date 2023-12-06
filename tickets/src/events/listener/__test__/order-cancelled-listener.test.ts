import { OrderCancelledEvent } from '@rs-ticketing/common';
import { Ticket } from '../../../models/ticket';
import { generateId } from '../../../test/id-generator';
import { natsWrapper } from '../../../utils/nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create and save a ticket
  const orderId = generateId();
  const ticket = Ticket.build({
    userId: generateId(),
    title: 'Big Concert',
    price: 1999,
  });
  ticket.set({ orderId });
  await ticket.save();

  // creating a fake data event replicating the ticket update event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // creating a fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg, orderId };
};

it('sets the userId to the ticket', async () => {
  const { listener, ticket, data, msg, orderId } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.orderId).not.toBeDefined();
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes an event', async () => {
  const { listener, data, msg, orderId } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
  const updatedTicket = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(updatedTicket.orderId).not.toBeDefined();
});
