import { getCurrentUser } from '@/helper/current-user';

export default async function Home() {
  console.log('home');
  const currentUser = await getCurrentUser();
  console.log(currentUser);
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      {currentUser ? <h1>Signed innnnnnnnn</h1> : <h1>Not signed in</h1>}
    </main>
  );
}
