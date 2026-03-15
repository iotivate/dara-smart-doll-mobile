import { Buffer } from 'buffer';

export const base64Encode = (str: string) =>
  Buffer.from(str, 'utf8').toString('base64');

export const base64Decode = (base64: string) =>
  Buffer.from(base64, 'base64').toString('utf8');
