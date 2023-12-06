import { generateId } from '../../test/id-generator';
import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  const userId = generateId();
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId,
  });
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 20 });

  await firstInstance!.save();
  await expect(secondInstance!.save()).rejects.toThrow();
});

it('increments the version flag with every save on the ticket', async () => {
  const userId = generateId();
  const ticket = Ticket.build({
    title: 'concert',
    price: 4,
    userId,
  });

  // testing non identical saves
  await ticket.save();
  expect(ticket.version).toEqual(0);
  ticket.set({ price: 10 });
  await ticket.save();
  expect(ticket.version).toEqual(1);
  ticket.set({ price: 20 });
  await ticket.save();
  expect(ticket.version).toEqual(2);

  // to test identical saves
  await ticket.save();
  expect(ticket.version).toEqual(3);
  await ticket.save();
  expect(ticket.version).toEqual(4);
});

// Dropping this test case as now version flag will increase even if we have identical save as long as this is save this flag will increase as this is how mongoose-update-if-current-plugin works
// it('doesnot increments the version flag with every identical save on the ticket', async () => {
//   const userId = generateId();
//   const ticket = Ticket.build({
//     title: 'concert',
//     price: 4,
//     userId,
//   });
//   await ticket.save();
//   expect(ticket.version).toEqual(0);
//   await ticket.save();
//   expect(ticket.version).toEqual(0);
//   await ticket.save();
//   expect(ticket.version).not.toEqual(1);
// });
