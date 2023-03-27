import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';
import { Flexbox, Icon, Typography } from 'mrcamel-ui';
import styled from '@emotion/styled';

import Axios from '@library/axios';

import { AUTH_PATH_NAMES } from '@constants/common';

import { convertQueryStringByObject } from '@utils/common';

function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();

  const authenticating = useMemo(() => {
    if (AUTH_PATH_NAMES.includes(router.pathname) && Axios.getAccessToken()) {
      return false;
    }
    return AUTH_PATH_NAMES.includes(router.pathname);
  }, [router.pathname]);

  useEffect(() => {
    if (AUTH_PATH_NAMES.includes(router.pathname) && !Axios.getAccessToken()) {
      router.replace({
        pathname: '/login',
        query: {
          returnUrl: `${router.pathname}${convertQueryStringByObject(router.query)}`,
          isRequiredLogin: true
        }
      });
    }
  }, [router]);

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
