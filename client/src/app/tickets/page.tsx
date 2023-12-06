import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { axiosBuilder } from '@/utils/axios-builder';
import { AllTicketResponse } from '@/utils/ticket-interfaces';
import Link from 'next/link';

async function populateAllTickets() {
  const axiosBuild = axiosBuilder('server');
  try {
    const res = await axiosBuild.get('/api/v1/tickets');
    return (res as unknown as any).data as AllTicketResponse;
  } catch (err: any) {
    console.error('Error occured during getCurrentUser :' + err.message);
  }
  return null;
}

export default async function TicketMain() {
  const allTickets = await populateAllTickets();
  if (!allTickets) return <div>Something went bad !!!</div>;

  return (
    <div className='flex min-h-screen flex-col items-center justify-between px-48 py-12'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-left'>Title</TableHead>
            <TableHead className='text-right'>Price (in inr)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTickets.tickets.map((ticket, i) => (
            <TableRow key={i}>
              <TableCell className='font-medium text-left'>
                <Link href={`/tickets/${ticket.id}`}>{ticket.title}</Link>
              </TableCell>
              <TableCell className='text-right'>
                {ticket.price.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
