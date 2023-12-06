import { TicketCard } from '@/components/custom/non-common/ticket-card';
import { axiosBuilder } from '@/utils/axios-builder';
import { TicketDoc } from '@/utils/ticket-interfaces';

async function getTicket(ticketId: string) {
  const axiosBuild = axiosBuilder('server');
  try {
    const res = await axiosBuild.get(`/api/v1/tickets/${ticketId}`);
    return (res as unknown as any).data as TicketDoc;
  } catch (err: any) {
    console.error('Error occured during getCurrentUser :' + err.message);
  }
  return null;
}

export default async function Page({
  params,
}: {
  params: { ticketId: string };
}) {
  const ticket = await getTicket(params.ticketId);
  if (!ticket) return <div>Somthing went bad !!!</div>;

  return (
    <div className='flex min-h-screen flex-col items-center justify-between px-48 py-12'>
      <TicketCard ticket={ticket} />
    </div>
  );
}
