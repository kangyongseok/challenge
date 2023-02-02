import type { NextApiRequest, NextApiResponse } from 'next';

import { fetchDevLogin } from '@api/userAuth';

import { setCookie } from '@utils/cookies';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const {
        body: { testUserId }
      }: {
        body: { testUserId: string };
      } = req;
      const userSnsLoginResult = await fetchDevLogin(testUserId);

      const expires = new Date();
      expires.setDate(365);

      setCookie('accessUser', encodeURIComponent(JSON.stringify(userSnsLoginResult.accessUser)), {
        req,
        res,
        domain: process.env.NODE_ENV !== 'development' ? '.mrcamel.co.kr' : '',
        path: '/',
        expires,
        httpOnly: true,
        sameSite: 'lax'
      });
      setCookie('accessToken', userSnsLoginResult.jwtToken, {
        req,
        res,
        domain: process.env.NODE_ENV !== 'development' ? '.mrcamel.co.kr' : '',
        path: '/',
        expires,
        httpOnly: true,
        sameSite: 'lax'
      });

      res.statusCode = 200;

      return res.send(userSnsLoginResult);
    } catch {
      return res.end();
    }
  }

  res.statusCode = 405;

  return res.end();
};
