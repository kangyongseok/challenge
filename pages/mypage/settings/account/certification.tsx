import { useEffect } from 'react';

import { useRouter } from 'next/router';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Icon } from 'mrcamel-ui';
import axios from 'axios';
import styled from '@emotion/styled';

import GeneralTemplate from '@components/templates/GeneralTemplate';

import Initializer from '@library/initializer';
import { logEvent } from '@library/amplitude';

import { postUserCerts } from '@api/user';

import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { getCookies } from '@utils/cookies';

function SettingAccountSuccess({
  userCert
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  useEffect(() => {
    if (userCert) {
      logEvent(attrKeys.mypage.SUBMIT_USER_CERT, {
        name: attrProperty.name.ACCOUNT_MANAGE,
        data: userCert
      });
    }
    router.replace('/mypage/settings/account');
  }, [router, userCert]);

  return (
    <GeneralTemplate
      disablePadding
      hideAppDownloadBanner
      customStyle={{
        '& > div': {
          justifyContent: 'center',
          alignItems: 'center'
        }
      }}
    >
      <LoadingIcon name="LoadingFilled" width={48} height={48} />
    </GeneralTemplate>
  );
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

export async function getServerSideProps({
  req,
  query: { imp_uid, success }
}: GetServerSidePropsContext) {
  Initializer.initAccessTokenByCookies(getCookies({ req }));

  if (!imp_uid || success !== 'true') {
    return {
      props: {
        userCert: null
      }
    };
  }

  try {
    const {
      data: {
        response: { access_token }
      }
    } = await axios.post(
      'https://api.iamport.kr/users/getToken',
      {
        imp_key: process.env.IMP_API_KEY,
        imp_secret: process.env.IMP_SECRET_KEY
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const {
      data: {
        response: { name, birth, birthday, gender, unique_key, unique_in_site }
      }
    } = await axios.get(`https://api.iamport.kr/certifications/${imp_uid}`, {
      headers: {
        Authorization: access_token
      }
    });

    const userCert = await postUserCerts({
      type: 0,
      name,
      gender,
      birth,
      birthday,
      ci: unique_key,
      di: unique_in_site
    });

    return {
      props: {
        userCert
      }
    };
  } catch {
    return {
      props: {
        userCert: null
      }
    };
  }
}

export default SettingAccountSuccess;
