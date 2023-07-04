import type { NextApiRequestCookies } from 'next/dist/server/api-utils';

import type { AccessUser } from '@dto/userAuth';

export default function getAccessUserByCookies({ accessUser }: NextApiRequestCookies) {
  try {
    const parsedAccessUser: Partial<AccessUser> = JSON.parse(String(accessUser) || 'null');
    return parsedAccessUser;
  } catch {
    return null;
  }
}
