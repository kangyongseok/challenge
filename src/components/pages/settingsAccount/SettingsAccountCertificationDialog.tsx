import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Button, Dialog, Typography } from '@mrcamelhub/camel-ui';

import { logEvent } from '@library/amplitude';

import { fetchUserCerts } from '@api/user';

import queryKeys from '@constants/queryKeys';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import useQueryAccessUser from '@hooks/useQueryAccessUser';

function SettingsAccountCertificationDialog() {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const { data: accessUser } = useQueryAccessUser();

  const { data, isLoading } = useQuery(queryKeys.users.userCerts(), () => fetchUserCerts(), {
    enabled: !!accessUser,
    refetchOnMount: true
  });

  const handleClick = () => {
    logEvent(attrKeys.mypage.SUBMIT_USER_CERT, {
      name: attrProperty.name.ACCOUNT_MANAGE
    });

    if (!window.IMP) return;

    window.IMP.certification(
      {
        pg: 'danal.B010008053',
        m_redirect_url: `${window.location.href}/certification`,
        popup: false
      },
      () => {
        //
      }
    );
  };

  useEffect(() => {
    if (data && !isLoading) {
      setOpen(!data.some(({ type }) => type === 0));
    }
  }, [data, isLoading]);

  return (
    <Dialog
      open={open}
      onClose={() => router.back()}
      fullWidth
      customStyle={{
        maxWidth: 311,
        padding: '32px 20px 20px'
      }}
    >
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          textAlign: 'center'
        }}
      >
        정산계좌를 입력하려면
        <br />
        본인인증이 필요해요.
      </Typography>
      <Button
        variant="solid"
        size="large"
        brandColor="black"
        fullWidth
        onClick={handleClick}
        customStyle={{
          marginTop: 32
        }}
      >
        본인인증하기
      </Button>
    </Dialog>
  );
}

export default SettingsAccountCertificationDialog;
