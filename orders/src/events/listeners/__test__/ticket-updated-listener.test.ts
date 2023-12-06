import { TicketUpdatedEvent } from '@rs-ticketing/common';
import { generateId } from '../../../test/id-generator';
import { natsWrapper } from '../../../utils/nats-wrapper';
import { Ticket } from '../../../models/tickets';
import { TicketUpdatedListener } from '../ticket-updated-event';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: generateId(),
    title: 'Big Concert',
    price: 1999,
  });
  await ticket.save();

  // creating a fake data event replicating the ticket update event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Big Concert 2',
    price: 2999,
    userId: generateId(),
  };

  // creating a fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('updates the ticket for ticket update event listener', async () => {
  const { listener, ticket, data, msg } = await setup();

  // calls the onMessage method for event processing
  await listener.onMessage(data, msg);

  // assertions around the event updation
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message when event is recieved', async () => {
  const { listener, data, msg } = await setup();

  // calling the onMessage method to replicate the processing of ticket
  await listener.onMessage(data, msg);

  // assertion to make sure ack fn is called
  expect(msg.ack).toHaveBeenCalled();
});

it('doesnot calls the ack for event with skipped version', async () => {
  const { listener, data, msg } = await setup();

  // version add to make it future event
  data.version = 10;

  // assertion to make sure ack fn is not called
  expect(listener.onMessage(data, msg)).rejects.toThrow();
  expect(msg.ack).not.toHaveBeenCalled();
});
