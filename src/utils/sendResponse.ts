import { ResponseType } from '../types/ResponseType';

export default (statusCode: number, body: string | unknown, headers = {} as ResponseType) => ({
  statusCode,
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    ...headers,
  },
});
