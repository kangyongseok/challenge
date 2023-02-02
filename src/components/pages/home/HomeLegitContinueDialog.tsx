import { useEffect, useState } from 'react';

import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Box, Button, Dialog, Flexbox, Typography } from 'mrcamel-ui';

import { logEvent } from '@library/amplitude';

import { SAVED_LEGIT_REQUEST_STATE } from '@constants/localStorage';
import attrProperty from '@constants/attrProperty';
import attrKeys from '@constants/attrKeys';

import { legitRequestState, productLegitParamsState } from '@recoil/legitRequest';
import useQueryUserData from '@hooks/useQueryUserData';
import useQueryMyUserInfo from '@hooks/useQueryMyUserInfo';
import useQueryAccessUser from '@hooks/useQueryAccessUser';

function HomeLegitContinueDialog() {
  const router = useRouter();

  const { data: accessUser } = useQueryAccessUser();
  const { userNickName } = useQueryMyUserInfo();
  const { data: userData, remove: removeUserData } = useQueryUserData();

  const setLegitRequestState = useSetRecoilState(legitRequestState);
  const setProductLegitParamsState = useSetRecoilState(productLegitParamsState);
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    logEvent(attrKeys.home.CLICK_LEGIT_MODAL, {
      name: attrProperty.name.LEGIT_RESET,
      att: 'OK'
    });

    const { state, params } = userData?.[SAVED_LEGIT_REQUEST_STATE] || {};

    if (state) setLegitRequestState(state);
    if (params) setProductLegitParamsState(params);

    removeUserData(SAVED_LEGIT_REQUEST_STATE);
    router.push('/legit/request/form');
  };

  const handleClose = () => {
    removeUserData(SAVED_LEGIT_REQUEST_STATE);
    setOpen(false);
  };

  useEffect(() => {
    if (accessUser && !!userData?.[SAVED_LEGIT_REQUEST_STATE]) {
      logEvent(attrKeys.home.VIEW_LEGIT_MODAL, {
        name: attrProperty.name.LEGIT_RESET
      });
      setOpen(true);
    }
  }, [accessUser, userData]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      customStyle={{
        width: '100%',
        maxWidth: 311
      }}
    >
      <Box
        customStyle={{
          marginTop: 12,
          height: 52,
          lineHeight: '52px',
          fontSize: 52,
          textAlign: 'center'
        }}
      >
        🕵️
      </Box>
      <Typography
        variant="h3"
        weight="bold"
        customStyle={{
          marginTop: 32,
          textAlign: 'center'
        }}
      >
        이어서 진행하시겠습니까?
      </Typography>
      <Typography
        variant="h4"
        customStyle={{
          marginTop: 8,
          textAlign: 'center'
        }}
      >
        {userNickName}님! 사진감정신청을
        <br />
        이어서 진행하시겠습니까?
      </Typography>
      <Flexbox
        gap={8}
        direction="vertical"
        customStyle={{
          marginTop: 32
        }}
      >
        <Button variant="solid" brandColor="primary" size="large" fullWidth onClick={handleClick}>
          계속하기
        </Button>
        <Button variant="ghost" brandColor="black" size="large" fullWidth onClick={handleClose}>
          아니요
        </Button>
      </Flexbox>
    </Dialog>
  );
}

export default HomeLegitContinueDialog;
