import { TicketCreatedEvent } from '@rs-ticketing/common';
import { natsWrapper } from '../../../utils/nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { generateId } from '../../../test/id-generator';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/tickets';

const setup = () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  // creating a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: generateId(),
    version: 0,
    title: 'Movie Ticket',
    price: 500,
    userId: generateId(),
  };

  // creating a fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and save the ticket for ticket created event', async () => {
  const { listener, data, msg } = setup();

  // calling the onMessage method to replicate the processing of ticket
  await listener.onMessage(data, msg);

  // assertions to make sure the ticket is created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message when event is recieved', async () => {
  const { listener, data, msg } = setup();

  // calling the onMessage method to replicate the processing of ticket
  await listener.onMessage(data, msg);

  // assertion to make sure ack fn is called
  expect(msg.ack).toHaveBeenCalled();
});
