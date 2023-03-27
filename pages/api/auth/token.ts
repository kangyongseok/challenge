import type { NextApiRequest, NextApiResponse } from 'next';

import { setCookie } from '@utils/cookies';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const {
        body: { accessToken }
      }: {
        body: { accessToken: string };
      } = req;
      const isProduction = process.env.NODE_ENV !== 'development';

      setCookie('accessToken', accessToken, {
        req,
        res,
        domain: isProduction ? '.mrcamel.co.kr' : '',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: isProduction,
        secure: isProduction,
        sameSite: 'lax'
      });

      res.statusCode = 200;

      return res.send('Success');
    } catch {
      return res.end();
    }
  } else if (req.method === 'DELETE') {
    try {
      const {
        body: { accessToken }
      }: {
        body: { accessToken: string };
      } = req;
      const isProduction = process.env.NODE_ENV !== 'development';

      setCookie('accessToken', accessToken, {
        req,
        res,
        domain: isProduction ? '.mrcamel.co.kr' : '',
        path: '/',
        maxAge: -1,
        httpOnly: isProduction,
        secure: isProduction,
        sameSite: 'lax'
      });

      res.statusCode = 200;

      return res.send('Success');
    } catch {
      return res.end();
    }
  }

  res.statusCode = 405;

  return res.end();
};
