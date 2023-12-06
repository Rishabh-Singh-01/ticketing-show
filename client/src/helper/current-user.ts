import { axiosBuilder } from '@/utils/axios-builder';
import { CurrentUserResponse } from '@/utils/helper-interfaces';

export const getCurrentUser = async () => {
  const axiosBuild = axiosBuilder('server');
  try {
    const res = await axiosBuild.get('/api/v1/users/currentUser');
    console.log((res as any).data);
    return ((res as unknown as any).data as CurrentUserResponse).currentUser;
  } catch (err: any) {
    console.error('Error occured during getCurrentUser :' + err.message);
  }

  return null;
};
