import { createHash } from 'crypto';

function encryptPassword(userName: string): string {

  const hash = createHash('md5');
  hash.update(userName);
  return hash.digest('hex');
}

export { encryptPassword };
