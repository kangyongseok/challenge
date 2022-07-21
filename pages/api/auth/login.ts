import type { NextApiRequest, NextApiResponse } from 'next';

import type { UserSnsLoginInfo } from '@dto/userAuth';

import { postLogin } from '@api/userAuth';

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

      res.setHeader('Set-Cookie', [
        `accessUser=${encodeURIComponent(
          JSON.stringify(userSnsLoginResult.accessUser)
        )}; path=/; httpOnly; sameSite=lax;${
          process.env.NODE_ENV !== 'development' ? ' domain=.mrcamel.co.kr;' : ''
        }`,
        `accessToken=${userSnsLoginResult.jwtToken}; path=/; httpOnly; sameSite=lax;${
          process.env.NODE_ENV !== 'development' ? ' domain=.mrcamel.co.kr;' : ''
        }`
      ]);
      res.statusCode = 200;

      return res.send(userSnsLoginResult);
    } catch (error) {
      console.log('Auth Login API Error:', error);

      return res.end();
    }
  }

  res.statusCode = 405;

  return res.end();
};
