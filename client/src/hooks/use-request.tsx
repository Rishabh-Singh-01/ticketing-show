import axios from 'axios';
import { useState } from 'react';

import { GenericErrorInterface } from '@/utils/helper-interfaces';

// add probably like onFailure to create a failure callback so that a failure can be rendered easily
export function useRequest({
  url,
  method,
  body,
  onSuccess,
}: {
  url: string;
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  body: any;
  onSuccess: (data?: any) => void;
}) {
  const initalErr: { field?: string; message: string }[] = [];
  const [errors, setErrors] = useState(initalErr);

  const doRequest = async () => {
    try {
      setErrors(initalErr);
      const response = await axios[method](url, body);
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (err: any) {
      console.log('-------------------------');
      console.log(err);
      const errArr = (err.response.data as unknown as GenericErrorInterface)
        .errors || [
        {
          message: 'Internal Server Error',
        },
      ];
      setErrors(errArr);
    }
  };

  const doRequestErrors = () => {
    if (errors.length === 0) return null;

    return (
      <div>
        {errors.map((err) => (
          <li key={err.message}>{err.message}</li>
        ))}
      </div>
    );
  };

  return { doRequest, doRequestErrors };
}
