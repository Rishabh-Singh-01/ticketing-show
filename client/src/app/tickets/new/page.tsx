import { NewTicketForm } from '@/components/custom/non-common/new-ticket-form';

export default function CreateTicket() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-between p-24'>
      <NewTicketForm />
    </div>
  );
}
