'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '../../ui/button';
import { FormEvent, useState } from 'react';
import { useRequest } from '@/hooks/use-request';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { doRequest, doRequestErrors } = useRequest({
    url: '/api/v1/users/signup',
    method: 'post',
    body: {
      email,
      password,
    },
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log(event);
    await doRequest();
  };
  return (
    <form
      className='flex flex-col gap-4 w-1/3 p-4 rounded-lg border bg-card text-card-foreground shadow-sm'
      onSubmit={onSubmit}
    >
      <h3 className='mb-2 scroll-m-20 text-2xl font-semibold tracking-tight'>
        Sign Up Form
      </h3>
      <div className='flex flex-col gap-2'>
        <Label>Your email address: </Label>
        <Input
          type='email'
          placeholder='johndoe@example.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Type your Password: </Label>
        <Input
          type='password'
          placeholder='some password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {doRequestErrors()}
      <Button className='mt-4' type='submit'>
        Create your Account
      </Button>
    </form>
  );
}
