import axios from 'axios';
import { headers } from 'next/headers';

export function axiosBuilder(usedOn: 'client' | 'server') {
  if (usedOn === 'client') return axios.create();

  const headersObj: {
    [key: string]: string;
  } = {};
  headers().forEach((value, key) => (headersObj[key] = value));
  return axios.create({
    baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
    headers: headersObj,
  });
}
