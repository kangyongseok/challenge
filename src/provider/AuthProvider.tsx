import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { Flexbox, Icon, Typography } from '@mrcamelhub/camel-ui';
import styled from '@emotion/styled';

import type { AccessUser } from '@dto/userAuth';

import LocalStorage from '@library/localStorage';
import Axios from '@library/axios';

import { postDecrypt } from '@api/userAuth';
import { fetchMyUserInfo } from '@api/user';
import { postToken } from '@api/nextJs';

import queryKeys from '@constants/queryKeys';
import { ACCESS_TOKEN, ACCESS_USER } from '@constants/localStorage';
import {
  AUTH_PATH_NAMES,
  DECRYPT_LOGIN_PATH_NAMES,
  SMS_LOGIN_AUTH_PASS_PATH_NAMES
} from '@constants/common';

import { convertQueryStringByObject } from '@utils/common';

import { decryptPendingState } from '@recoil/common';
import useSignOut from '@hooks/useSignOut';
import useSession from '@hooks/useSession';

interface AuthProviderProps {
  accessUser?: Partial<AccessUser>;
}

function AuthProvider({ children, accessUser }: PropsWithChildren<AuthProviderProps>) {
  const router = useRouter();
  const { key } = router.query;

  const queryClient = useQueryClient();
  const { data: sessionAccessUser = accessUser, isFetching, isSuccess } = useSession();
  const signOut = useSignOut();

  const [decrypting, setDecrypting] = useState(false);
  const setDecryptPendingState = useSetRecoilState(decryptPendingState);

  const pendingRef = useRef(false);

  const authenticating = useMemo(() => {
    if (
      (AUTH_PATH_NAMES.includes(router.pathname) &&
        sessionAccessUser &&
        sessionAccessUser.snsType !== 'sms') ||
      (SMS_LOGIN_AUTH_PASS_PATH_NAMES.includes(router.pathname) &&
        sessionAccessUser &&
        sessionAccessUser.snsType === 'sms')
    ) {
      return false;
    }

    if (DECRYPT_LOGIN_PATH_NAMES.includes(router.pathname) && key) {
      return !decrypting;
    }

    return AUTH_PATH_NAMES.includes(router.pathname);
  }, [router.pathname, sessionAccessUser, key, decrypting]);

  useEffect(() => {
    if (!isSuccess || isFetching) return;

    const filteredAuthPathNamesForSmsLogin = AUTH_PATH_NAMES.filter(
      (pathname) => !SMS_LOGIN_AUTH_PASS_PATH_NAMES.includes(pathname)
    );

    if (
      filteredAuthPathNamesForSmsLogin.includes(router.pathname) &&
      sessionAccessUser &&
      sessionAccessUser.snsType === 'sms' &&
      !key
    ) {
      router.replace({
        pathname: '/login',
        query: {
          returnUrl: `${router.pathname}${convertQueryStringByObject(router.query)}`,
          isRequiredLogin: true
        }
      });
      return;
    }

    if (AUTH_PATH_NAMES.includes(router.pathname) && !sessionAccessUser && !key) {
      router.replace({
        pathname: '/login',
        query: {
          returnUrl: `${router.pathname}${convertQueryStringByObject(router.query)}`,
          isRequiredLogin: true
        }
      });
    }
  }, [isSuccess, isFetching, router, sessionAccessUser, key]);

  useEffect(() => {
    if (
      DECRYPT_LOGIN_PATH_NAMES.includes(router.pathname) &&
      key &&
      !decrypting &&
      !pendingRef.current
    ) {
      setDecryptPendingState(true);
      pendingRef.current = true;

      const decrypt = async () => {
        try {
          const { accessUser: newAccessUser, jwtToken } = await postDecrypt(String(key));

          await signOut();
          await postToken(jwtToken, newAccessUser);

          LocalStorage.set(ACCESS_USER, newAccessUser);
          LocalStorage.set(ACCESS_TOKEN, jwtToken);
          Axios.setAccessToken(jwtToken);

          await queryClient.fetchQuery(queryKeys.users.myUserInfo(), fetchMyUserInfo);

          setDecrypting(true);
          setDecryptPendingState(false);
        } catch {
          setDecryptPendingState(false);
          setDecrypting(false);
        } finally {
          pendingRef.current = false;
        }
      };

      decrypt();
    }
  }, [setDecryptPendingState, router.pathname, key, decrypting, signOut, queryClient]);

  if (authenticating) {
    return (
      <Flexbox
        alignment="center"
        justifyContent="center"
        customStyle={{
          height: '100vh'
        }}
      >
        <Flexbox direction="vertical" alignment="center" gap={20}>
          <LoadingIcon name="LoadingFilled" width={48} height={48} />
          <Typography variant="h3" weight="bold">
            로그인 중 입니다.
          </Typography>
        </Flexbox>
      </Flexbox>
    );
  }

  return children as ReactElement;
}

const LoadingIcon = styled(Icon)`
  animation: rotate 1s linear infinite;
  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default AuthProvider;
