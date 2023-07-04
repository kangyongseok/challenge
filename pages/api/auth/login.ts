import type { NextApiRequest, NextApiResponse } from 'next';

import type { UserSnsLoginInfo } from '@dto/userAuth';

import { postLogin } from '@api/userAuth';

import { setCookie } from '@utils/cookies';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const {
        body: { userSnsLoginInfo, deviceId }
      }: {
        body: { userSnsLoginInfo: UserSnsLoginInfo; deviceId: string };
      } = req;
      const userSnsLoginResult = await postLogin({
        deviceId,
        userSnsLoginInfo
      });

      setCookie('accessToken', userSnsLoginResult.jwtToken, {
        req,
        res,
        domain: process.env.NODE_ENV !== 'development' ? '.mrcamel.co.kr' : '',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });

      setCookie('accessUser', userSnsLoginResult.accessUser, {
        req,
        res,
        domain: process.env.NODE_ENV !== 'development' ? '.mrcamel.co.kr' : '',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: true,
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
