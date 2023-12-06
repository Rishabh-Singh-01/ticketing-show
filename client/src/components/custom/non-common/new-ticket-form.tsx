'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormEvent, useState } from 'react';
import { useRequest } from '@/hooks/use-request';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function NewTicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, doRequestErrors } = useRequest({
    url: '/api/v1/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => {
      router.push('/tickets');
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log(event);
    await doRequest();

    setTitle('');
    setPrice('');
  };

  const onBlurHandler = () => {
    const value = parseFloat(price);
    if (isNaN(value)) return;

    setPrice(value.toFixed(2));
  };
  return (
    <form
      className='flex flex-col gap-4 w-1/3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm'
      onSubmit={onSubmit}
    >
      <h3 className='mb-2 scroll-m-20 text-2xl font-semibold tracking-tight'>
        Create New Ticket
      </h3>
      <div className='flex flex-col gap-2'>
        <Label>Title: </Label>
        <Input
          type='text'
          placeholder='Imaginary Concert'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Price: </Label>
        <Input
          type='number'
          placeholder='Rs 2000.00'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={onBlurHandler}
        />
      </div>
      {doRequestErrors()}
      <Button className='mt-4' type='submit'>
        Create New Ticket
      </Button>
    </form>
  );
}
