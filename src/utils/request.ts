import superagent from 'superagent';
import { web } from './env';

type METHODS = 'get' | 'post' | 'put' | 'del';

const REQUEST_MAP: Record<METHODS, 'query' | 'send'> = {
  get: 'query',
  post: 'send',
  put: 'send',
  del: 'send',
};

const httpClientAdvanced = ({ baseUrl = '' }: { baseUrl: string }) => {
  if (baseUrl.endsWith('/')) throw new Error("[ajax] create client failed: baseUrl must NOT ends with '/'");

  const request = async <Q extends Record<string, unknown>, R>(type: METHODS, url: string, reqBody: Q): Promise<R> => {
    // TODO: SSR or remove SSR
    if (!web) return new Promise(resolve => resolve);

    const { body } = await superagent[type](`${baseUrl}${url}`)[REQUEST_MAP[type]](reqBody).set({
      Accept: 'application/json',
    });
    return body;
  };

  return {
    get: <Q extends Record<string, unknown>, R>(url: string, reqBody: Q): Promise<R> =>
      request<Q, R>('get', url, reqBody),
    post: <Q extends Record<string, unknown>, R>(url: string, reqBody: Q): Promise<R> =>
      request<Q, R>('post', url, reqBody),
    put: <Q extends Record<string, unknown>, R>(url: string, reqBody: Q): Promise<R> =>
      request<Q, R>('put', url, reqBody),
    del: <Q extends Record<string, unknown>, R>(url: string, reqBody: Q): Promise<R> =>
      request<Q, R>('del', url, reqBody),
  };
};

export const intranetClient = httpClientAdvanced({ baseUrl: 'https://jsonplaceholder.typicode.com' });
